# turtle.py - Python turtle graphics shim (V2)
# CodeScapes Turtle Engine V2 - Protocol Compliant

import math
import json
import sys
import time
import builtins

# JS interop
try:
    import js
    _HAS_JS = True
except ImportError:
    import collections
    Point = collections.namedtuple('Point', ['x', 'y'])
    _HAS_JS = False

# ===== Protocol Utilities =====

def _send_cmd(cmd_type: str, args: dict):
    """Send a V2 Protocol command to the main thread."""
    if not _HAS_JS:
        return
    try:
        # Wrap in Protocol V2 Envelope
        payload = json.dumps({
            'type': 'TURTLE_CMD',
            'payload': {
                'cmd': cmd_type,
                **args
            }
        })
        js.postMessage(js.JSON.parse(payload))
    except Exception as e:
        print(f"[turtle] Error sending {cmd_type}: {e}", file=sys.stderr)

def _poll_events():
    """Poll for events using sync XHR."""
    if not _HAS_JS: return
    try:
        xhr = js.XMLHttpRequest.new()
        xhr.open("GET", "/_turtle_events", False)  # Synchronous
        xhr.send(None)
        if xhr.status == 200:
            text = xhr.responseText
            if text and text.strip():
                events = json.loads(text)
                screen = Screen._instance
                if screen:
                    for event in events:
                        etype = event.get("type", "keydown")
                        if etype == "keydown":
                            key = event.get("key")
                            if key in screen._key_handlers:
                                try: screen._key_handlers[key]()
                                except: pass
                        elif etype == "keyup":
                             pass 
                        elif etype == "click":
                             x, y, tid = event.get("x"), event.get("y"), event.get("id")
                             if tid is not None and tid in screen._turtles:
                                 t = screen._turtles[tid]
                                 if t._onclick_handler:
                                     try: t._onclick_handler(x, y)
                                     except: pass
                             else:
                                 if screen._onclick_handler:
                                     try: screen._onclick_handler(x, y)
                                     except: pass
    except Exception:
        pass

# ===== Core Classes =====

class TurtleScreenBase:
    pass

class _Screen(TurtleScreenBase):
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance
    
    def _init(self):
        self._width = 800
        self._height = 600
        self._bgcolor = "white"
        self._bgpic = None
        self._tracer_n = 1
        self._tracer_delay = 10
        self._key_handlers = {}
        self._onclick_handler = None
        self._mode = "standard"
        self._colormode = 1.0 
        self._turtles = {}
        self._timers = [] 
        self._shapes = ["classic", "arrow", "turtle", "circle", "square", "triangle"]
        
        # Send INIT (Defaults)
        _send_cmd("INIT", {
            "width": self._width, 
            "height": self._height,
            "mode": self._mode
        })

    def _check_timers(self):
        if not self._timers: return
        now = time.time() * 1000
        remaining = []
        to_run = []
        for expiry, fun in self._timers:
            if now >= expiry: to_run.append(fun)
            else: remaining.append((expiry, fun))
        self._timers = remaining
        for f in to_run:
            try: f()
            except: pass

    # --- Window Control ---
    def setup(self, width=800, height=600, startx=None, starty=None):
        self._width = width
        self._height = height
        _send_cmd("SETUP", {"width": width, "height": height})
    
    def bgcolor(self, *args):
        if not args: return self._bgcolor
        self._bgcolor = _make_color(args, self._colormode)
        _send_cmd("BGCOLOR", {"color": self._bgcolor})
        
    def bgpic(self, picname=None):
        if picname is None: return self._bgpic
        self._bgpic = picname
        if picname != "nopic":
             _send_cmd("BGPIC", {"url": picname})

    def clearscreen(self):
        _send_cmd("CLEAR_SCREEN", {})
        self._turtles = {}
        # Re-init default turtle?
        global _default_turtle
        _default_turtle = None
        
    def resetscreen(self):
        for t in list(self._turtles.values()):
            t.reset()

    def screensize(self, canvwidth=None, canvheight=None, bg=None):
        if canvwidth is None: return (self._width, self._height)
        # We don't support scrolling yet, assume setup() usage
        return (self._width, self._height)
        
    def setworldcoordinates(self, llx, lly, urx, ury):
        _send_cmd("SET_COORDS", {"llx": llx, "lly": lly, "urx": urx, "ury": ury})

    # --- Animation ---
    def tracer(self, n=None, delay=None):
        if n is None: return self._tracer_n
        self._tracer_n = int(n)
        if delay is not None: self._tracer_delay = int(delay)

    def update(self):
        _poll_events()
        
    def delay(self, delay=None):
        if delay is None: return self._tracer_delay
        self._tracer_delay = int(delay)
        
    class _NoAnimContext:
        def __init__(self, screen): self.s = screen; self.prev = 1
        def __enter__(self): self.prev = self.s.tracer(); self.s.tracer(0)
        def __exit__(self, *a): self.s.tracer(self.prev); self.s.update()

    def no_animation(self):
        return self._NoAnimContext(self)

    # --- Events ---
    def listen(self, xdummy=None, ydummy=None):
        _send_cmd("LISTEN", {})

    def onkey(self, fun, key):
        if fun is None:
            if key in self._key_handlers: del self._key_handlers[key]
        else:
            self._key_handlers[key] = fun
    
    def onkeypress(self, fun, key=None):
        self.onkey(fun, key)
        
    def onkeyrelease(self, fun, key):
        self.onkey(fun, key)
    
    def onclick(self, fun, btn=1, add=None):
        self._onclick_handler = fun
        
    def onscreenclick(self, fun, btn=1, add=None):
        self.onclick(fun, btn, add)

    def ontimer(self, fun, t=0):
        expiry = (time.time() * 1000) + t
        self._timers.append((expiry, fun))

    def mainloop(self):
        while True:
            _poll_events()
            self._check_timers()
            time.sleep(0.01) 
    
    def done(self): self.mainloop()

    def bye(self):
        # In browser environment, we might stop the runner, but exiting process isn't right.
        # However, for script parity:
        sys.exit(0)

    def exitonclick(self):
        def _bye(x,y): self.bye()
        self.onclick(_bye)
        self.mainloop()

    # --- Settings ---
    def mode(self, mode=None):
        if mode is None: return self._mode
        self._mode = mode
        
    def colormode(self, mode=None):
        if mode is None: return self._colormode
        self._colormode = float(mode)
        
    def getcanvas(self): return None # Shim
    
    def getshapes(self): return self._shapes
    
    def register_shape(self, name, shape=None):
        if name not in self._shapes:
            self._shapes.append(name)
    addshape = register_shape
    
    def turtles(self):
        return list(self._turtles.values())
        
    def window_height(self): return self._height
    def window_width(self): return self._width
    
    # --- Input ---
    def textinput(self, title, prompt):
        # Use standard input (patched to be blocking in worker)
        print(f"[{title}] {prompt}")
        return builtins.input(prompt)

    def numinput(self, title, prompt, default=None, minval=None, maxval=None):
        print(f"[{title}] {prompt}")
        while True:
            res = builtins.input(prompt)
            if not res and default is not None: return default
            try:
                val = float(res)
                if minval is not None and val < minval: continue
                if maxval is not None and val > maxval: continue
                return val
            except: pass


def Screen():
    if _Screen._instance is None: return _Screen()
    return _Screen._instance

_Screen._instance = _Screen.__new__(_Screen) # Pre-init

class Turtle:
    def __init__(self, shape="classic", visible=True):
        self._id = id(self)
        Screen()._turtles[self._id] = self
        self._x = 0.0
        self._y = 0.0
        self._heading = 0.0 # Standard Degrees (0-360)
        self._fullcircle = 360.0
        self._visible = visible
        self._shape = shape
        self._filling = False
        self._pen_down = True
        self._pencolor = "black"
        self._fillcolor = "black"
        self._pensize = 1
        self._speed = 3
        self._stretch_wid = 1.0
        self._stretch_len = 1.0
        self._outline = 1
        self._onclick_handler = None
        
        _send_cmd("CREATE", {"id": self._id, "shape": shape, "visible": visible})

    # --- Measurement Units ---
    def degrees(self, fullcircle=360.0):
        self._fullcircle = float(fullcircle)
        
    def radians(self):
        self._fullcircle = 2 * math.pi
        
    def _to_degrees(self, angle):
        return angle * (360.0 / self._fullcircle)
        
    def _from_degrees(self, angle):
        return angle * (self._fullcircle / 360.0)

    # --- Motion ---

    def forward(self, distance):
        deg = math.radians(self._heading)
        self._x += distance * math.cos(deg)
        self._y += distance * math.sin(deg)
        _send_cmd("MOVE", {
            "id": self._id, 
            "x": self._x, 
            "y": self._y,
            "pen_down": self._pen_down,
            "color": self._pencolor,
            "width": self._pensize
        })
    fd = forward

    def back(self, distance):
        self.forward(-distance)
    bk = backward = back

    def goto(self, x, y=None):
        if y is None: x, y = x
        self._x = float(x)
        self._y = float(y)
        _send_cmd("MOVE", {
            "id": self._id, 
            "x": self._x, 
            "y": self._y,
            "pen_down": self._pen_down,
            "color": self._pencolor,
            "width": self._pensize
        })
    setpos = setposition = goto
    
    def setx(self, x): self.goto(x, self._y)
    def sety(self, y): self.goto(self._x, y)
    
    def teleport(self, x, y=None, fill_gap=False):
        pd = self._pen_down
        self.penup()
        self.goto(x, y)
        if pd: self.pendown()

    def right(self, angle):
        deg = self._to_degrees(angle)
        self._heading = (self._heading - deg) % 360
        _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
    rt = right
    
    def left(self, angle):
        deg = self._to_degrees(angle)
        self._heading = (self._heading + deg) % 360
        _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
    lt = left
    
    def setheading(self, to_angle):
        deg = self._to_degrees(to_angle)
        self._heading = deg % 360
        _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
    seth = setheading
    
    def heading(self):
        return self._from_degrees(self._heading)

    def home(self):
        self.goto(0, 0)
        self.setheading(0)
    
    def circle(self, radius, extent=None, steps=None):
        _send_cmd("CIRCLE", {
            "id": self._id,
            "radius": float(radius),
            "extent": float(extent) if extent is not None else None,
            "steps": int(steps) if steps is not None else None,
            "pen_down": self._pen_down 
        })
        # Simplified state update
        if extent is None: extent = 360
        # self.right(extent)? Depends on radius sign.
        # For parity, we assume left turn if positive radius.
        self._heading = (self._heading + extent) % 360

    def stamp(self):
        stamp_id = int(self._id * 10000 + (self._x + self._y) % 10000)
        _send_cmd("STAMP", {
            "id": self._id, 
            "stampId": stamp_id,
            "x": self._x, 
            "y": self._y, 
            "heading": self._heading, 
            "shape": self._shape,
            "color": self._pencolor,
            "fillColor": self._fillcolor,
            "stretchWid": self._stretch_wid,
            "stretchLen": self._stretch_len
        })
        return stamp_id
    
    def clearstamp(self, stampid):
        _send_cmd("CLEAR_STAMPS", {"id": self._id, "stampId": stampid})

    def clearstamps(self, n=None):
        _send_cmd("CLEAR_STAMPS", {"id": self._id, "n": n})

    def shapesize(self, stretch_wid=None, stretch_len=None, outline=None):
        if stretch_wid is None: return (self._stretch_wid, self._stretch_len, self._outline)
        if stretch_len is None: stretch_len = stretch_wid
        self._stretch_wid = float(stretch_wid)
        self._stretch_len = float(stretch_len)
        if outline is not None: self._outline = float(outline)
        
        _send_cmd("UPDATE_TURTLE", {
            "id": self._id, 
            "stretchWid": self._stretch_wid, 
            "stretchLen": self._stretch_len,
            "shape": self._shape
        })
    turtlesize = shapesize
    
    def resizemode(self, rmode=None):
        # Stub
        return "user"

    def towards(self, x, y=None):
        if y is None: 
            if hasattr(x, "xcor"): x, y = x.xcor(), x.ycor()
            else: x, y = x
        dx = x - self._x
        dy = y - self._y
        return math.degrees(math.atan2(dy, dx)) % 360
    
    def dot(self, size=None, color=None):
        _send_cmd("DOT", {"id": self._id, "size": size, "color": color})
        
    def write(self, arg, move=False, align="left", font=("Arial", 8, "normal")):
        _send_cmd("WRITE", {
            "id": self._id,
            "arg": str(arg),
            "move": move,
            "align": align,
            "font": font
        })

    # --- Pen Control ---

    def pendown(self):
        self._pen_down = True
    
    def penup(self):
        self._pen_down = False
        
    def pensize(self, width=None):
        if width is None: return self._pensize
        self._pensize = width
        _send_cmd("PEN_UPDATE", {"id": self._id, "width": self._pensize})
    width = pensize

    def pen(self, pen=None, **pendict):
        if pen is None and not pendict:
            return {
                "shown": self._visible,
                "pendown": self._pen_down,
                "pencolor": self._pencolor,
                "fillcolor": self._fillcolor,
                "pensize": self._pensize,
                "speed": self._speed,
                "resizemode": "user",
                "stretchfactor": (self._stretch_wid, self._stretch_len),
                "shearfactor": 0,
                "outline": self._outline,
                "tilt": 0
            }
        _p = {}
        if pen: _p.update(pen)
        _p.update(pendict)
        if "pd" in _p: self.pendown() if _p["pd"] else self.penup()
        if "pendown" in _p: self.pendown() if _p["pendown"] else self.penup()
        if "pencolor" in _p: self.pencolor(_p["pencolor"])
        if "fillcolor" in _p: self.fillcolor(_p["fillcolor"])
        if "pensize" in _p: self.pensize(_p["pensize"])
        if "speed" in _p: self.speed(_p["speed"])
        if "stretchfactor" in _p: self.shapesize(*_p["stretchfactor"])
    
    def isdown(self): return self._pen_down

    # --- Color ---

    def color(self, *args):
        if not args: return (self._pencolor, self._fillcolor)
        l = len(args)
        if l == 1: p = f = args[0]
        elif l == 2: p, f = args
        elif l == 3: p = f = args # r,g,b
        else: p = f = "black"
        
        cmode = Screen().colormode()
        self._pencolor = _make_color(p, cmode)
        self._fillcolor = _make_color(f, cmode)
        _send_cmd("PEN_UPDATE", {"id": self._id, "color": self._pencolor, "fillColor": self._fillcolor})

    def pencolor(self, *args):
        if not args: return self._pencolor
        cmode = Screen().colormode()
        self._pencolor = _make_color(args, cmode)
        _send_cmd("PEN_UPDATE", {"id": self._id, "color": self._pencolor})

    def fillcolor(self, *args):
        if not args: return self._fillcolor
        cmode = Screen().colormode()
        self._fillcolor = _make_color(args, cmode)
        _send_cmd("PEN_UPDATE", {"id": self._id, "fillColor": self._fillcolor})

    def begin_fill(self):
        self._filling = True
        _send_cmd("BEGIN_FILL", {"id": self._id})

    def end_fill(self):
        self._filling = False
        _send_cmd("END_FILL", {"id": self._id, "color": self._fillcolor})
        
    def onclick(self, fun, btn=1, add=None):
        self._onclick_handler = fun
    
    def onrelease(self, fun, btn=1, add=None):
        pass # Stub
        
    def ondrag(self, fun, btn=1, add=None):
        pass # Stub

    # --- State ---

    def shape(self, name=None):
        if name is None: return self._shape
        self._shape = name
        _send_cmd("UPDATE_TURTLE", {"id": self._id, "shape": name})
    
    def speed(self, speed=None):
        if speed is None: return self._speed
        self._speed = speed
        _send_cmd("UPDATE_TURTLE", {"id": self._id, "speed": speed})

    def hideturtle(self):
        self._visible = False
        _send_cmd("HIDE", {"id": self._id})
    ht = hideturtle

    def showturtle(self):
        self._visible = True
        _send_cmd("SHOW", {"id": self._id})
    st = showturtle

    def isvisible(self): return self._visible

    def xcor(self): return self._x
    def ycor(self): return self._y
    def position(self): return (self._x, self._y)
    pos = position

    def heading(self):
        return self._from_degrees(self._heading)
    
    def distance(self, x, y=None):
        if y is None:
             if hasattr(x, "xcor"): x, y = x.xcor(), x.ycor()
             else: x, y = x
        return math.sqrt((self._x - x)**2 + (self._y - y)**2)
        
    def reset(self):
        self.home()
        self.clear()
        
    def clear(self):
        # Clears current drawings. 
        # In current protocol, we don't support per-turtle clear except via timestamps/ids?
        pass
        
    def clone(self):
        t = Turtle(shape=self._shape, visible=self._visible)
        t._x, t._y = self._x, self._y
        t._heading = self._heading
        t._pencolor = self._pencolor
        t._fillcolor = self._fillcolor
        t._pensize = self._pensize
        t._speed = self._speed
        t._pen_down = self._pen_down
        
        t.penup()
        t.goto(self._x, self._y)
        t.setheading(self._heading)
        if self._pen_down: t.pendown()
        t.color(self._pencolor, self._fillcolor)
        t.pensize(self._pensize)
        return t

    def settiltangle(self, angle): pass
    tiltangle = settiltangle
    def tilt(self, angle): pass
    def shapetransform(self, t11=None, t12=None, t21=None, t22=None): return (1,0,0,1)
    def shearfactor(self, shear=None): return 0
    def get_shapepoly(self): return ((0,0),)
    def begin_poly(self): pass
    def end_poly(self): pass
    def get_poly(self): return ((0,0),)
    def getturtle(self): return self
    def getpen(self): return self
    def getscreen(self): return Screen()
    def undo(self): pass
    def setundobuffer(self, size): pass
    def undobufferentries(self): return 0

# ===== Helper Functions =====

def _make_color(args, cmode):
    """Normalize color args to CSS string."""
    if isinstance(args, tuple) and len(args) == 1: args = args[0]
    if isinstance(args, str): return args
    if isinstance(args, (list, tuple)):
        if len(args) == 3:
            r, g, b = args
            if cmode == 255:
                return f"rgb({int(r)}, {int(g)}, {int(b)})"
            else:
                return f"rgb({int(r*255)}, {int(g*255)}, {int(b*255)})"
    return "black"

# ===== Functional Interface =====

_default_turtle = None
def _get_turtle():
    global _default_turtle
    if _default_turtle is None: _default_turtle = Turtle()
    return _default_turtle

def forward(d): _get_turtle().forward(d)
fd = forward
def back(d): _get_turtle().back(d)
bk = backward = back
def right(a): _get_turtle().right(a)
rt = right
def left(a): _get_turtle().left(a)
lt = left
def goto(x, y=None): _get_turtle().goto(x, y)
setpos = setposition = goto
def setx(x): _get_turtle().setx(x)
def sety(y): _get_turtle().sety(y)
def setheading(h): _get_turtle().setheading(h)
seth = setheading
def home(): _get_turtle().home()
def circle(r, e=None, s=None): _get_turtle().circle(r, e, s)
def dot(s=None, c=None): _get_turtle().dot(s, c)
def stamp(): return _get_turtle().stamp()
def clearstamp(id): _get_turtle().clearstamp(id)
def clearstamps(n=None): _get_turtle().clearstamps(n)
def speed(s=None): return _get_turtle().speed(s)
def color(*a): return _get_turtle().color(*a)
def pencolor(*a): return _get_turtle().pencolor(*a)
def fillcolor(*a): return _get_turtle().fillcolor(*a)
def begin_fill(): _get_turtle().begin_fill()
def end_fill(): _get_turtle().end_fill()
def pendown(): _get_turtle().pendown()
pd = down = pendown
def penup(): _get_turtle().penup()
pu = up = penup
def pensize(w=None): return _get_turtle().pensize(w)
width = pensize
def hideturtle(): _get_turtle().hideturtle()
ht = hideturtle
def showturtle(): _get_turtle().showturtle()
st = showturtle
def isvisible(): return _get_turtle().isvisible()
def shape(n=None): return _get_turtle().shape(n)
def shapesize(*a): return _get_turtle().shapesize(*a)
turtlesize = shapesize
def shearfactor(s=None): return _get_turtle().shearfactor(s)
def tilt(a): _get_turtle().tilt(a)
def tiltangle(a=None): return _get_turtle().tiltangle(a)
def shapetransform(*a): return _get_turtle().shapetransform(*a)
def get_shapepoly(): return _get_turtle().get_shapepoly()
def write(arg, move=False, align="left", font=("Arial", 8, "normal")): _get_turtle().write(arg, move, align, font)
def clone(): return _get_turtle().clone()
def getturtle(): return _get_turtle()
def getpen(): return _get_turtle()
def getscreen(): return Screen()
def undo(): _get_turtle().undo()
def onrelease(f, b=1, a=None): _get_turtle().onrelease(f, b, a)
def ondrag(f, b=1, a=None): _get_turtle().ondrag(f, b, a)
def degrees(f=360.0): _get_turtle().degrees(f)
def radians(): _get_turtle().radians()

def xcor(): return _get_turtle().xcor()
def ycor(): return _get_turtle().ycor()
def heading(): return _get_turtle().heading()
def distance(x, y=None): return _get_turtle().distance(x, y)
def position(): return _get_turtle().position()
pos = position

def bgcolor(*a): return Screen().bgcolor(*a)
def bgpic(n=None): return Screen().bgpic(n)
def tracer(n=None, d=None): return Screen().tracer(n, d)
def update(): Screen().update()
def listen(x=None, y=None): Screen().listen(x, y)
def onkey(f, k): Screen().onkey(f, k)
def onkeyrelease(f, k): Screen().onkeyrelease(f, k)
def onkeypress(f, k=None): Screen().onkeypress(f, k)
def onclick(f, b=1, a=None): Screen().onclick(f, b, a)
def onscreenclick(f, b=1, a=None): Screen().onclick(f, b, a)
def ontimer(f, t=0): Screen().ontimer(f, t)
def setworldcoordinates(l,b,r,t): Screen().setworldcoordinates(l,b,r,t)
def screensize(w=None, h=None, b=None): return Screen().screensize(w, h, b)
def delay(d=None): return Screen().delay(d)
def done(): Screen().mainloop()
mainloop = done
def bye(): Screen().bye()
def exitonclick(): Screen().exitonclick()
def clearscreen(): Screen().clearscreen()
def resetscreen(): Screen().resetscreen()
def window_width(): return Screen().window_width()
def window_height(): return Screen().window_height()
def textinput(t, p): return Screen().textinput(t, p)
def numinput(t, p, d=None, mn=None, mx=None): return Screen().numinput(t, p, d, mn, mx)
def register_shape(n, s=None): Screen().register_shape(n, s)
def addshape(n, s=None): Screen().addshape(n, s)
def getshapes(): return Screen().getshapes()
def turtles(): return Screen().turtles()
def colormode(m=None): return Screen().colormode(m)
