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

_last_sync_time = 0

# ===== Vec2D Helper Class =====

class Vec2D(tuple):
    """A 2D vector class for turtle graphics calculations."""
    
    def __new__(cls, x, y):
        return tuple.__new__(cls, (x, y))
    
    def __add__(self, other):
        return Vec2D(self[0] + other[0], self[1] + other[1])
    
    def __sub__(self, other):
        return Vec2D(self[0] - other[0], self[1] - other[1])
    
    def __mul__(self, other):
        if isinstance(other, (int, float)):
            return Vec2D(self[0] * other, self[1] * other)
        # Dot product
        return self[0] * other[0] + self[1] * other[1]
    
    def __rmul__(self, other):
        return self.__mul__(other)
    
    def __neg__(self):
        return Vec2D(-self[0], -self[1])
    
    def __abs__(self):
        return math.sqrt(self[0]**2 + self[1]**2)
    
    def rotate(self, angle):
        """Rotate vector by angle (in degrees)."""
        rad = math.radians(angle)
        c, s = math.cos(rad), math.sin(rad)
        return Vec2D(self[0]*c - self[1]*s, self[0]*s + self[1]*c)
    
    def __repr__(self):
        return "(%.2f,%.2f)" % (self[0], self[1])

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

def _sync_fs(force=False):
    """Notify the worker to scan the filesystem for changes."""
    global _last_sync_time
    if not _HAS_JS: return
    
    now = time.time()
    # Throttled sync (every 2 seconds) or if forced
    if force or (now - _last_sync_time > 2.0):
        _last_sync_time = now
        try:
            # We call the globally exposed sync_fs function in JS
            js.sync_fs()
        except Exception:
            pass

def _poll_events():
    """Poll for events using sync XHR."""
    if not _HAS_JS: return
    
    # Map browser key names to standard turtle key names
    KEY_MAP = {
        'ArrowUp': 'Up',
        'ArrowDown': 'Down',
        'ArrowLeft': 'Left',
        'ArrowRight': 'Right',
        'Escape': 'Escape',
        'Return': 'Return',
        'Enter': 'Return',
        'Backspace': 'BackSpace',
        ' ': 'space',
        'Tab': 'Tab',
    }
    
    try:
        xhr = js.XMLHttpRequest.new()
        xhr.open("GET", "/_turtle_events", False)  # Synchronous
        xhr.send(None)
        if xhr.status == 200:
            text = xhr.responseText
            if text and text.strip():
                events = json.loads(text)
                screen = getattr(_Screen, '_instance', None)
                if screen and hasattr(screen, '_key_handlers'):
                    for event in events:
                        etype = event.get("type", "keydown")
                        x, y, tid = event.get("x"), event.get("y"), event.get("id")
                        
                        if etype == "keydown":
                            browser_key = event.get("key")
                            turtle_key = KEY_MAP.get(browser_key, browser_key)
                            if browser_key in screen._key_handlers:
                                try: screen._key_handlers[browser_key]()
                                except: pass
                            elif turtle_key in screen._key_handlers:
                                try: screen._key_handlers[turtle_key]()
                                except: pass
                        elif etype == "keyup":
                            pass
                        elif etype == "click":
                            if tid is not None and tid in screen._turtles:
                                t = screen._turtles[tid]
                                if hasattr(t, '_onclick_handler') and t._onclick_handler:
                                    try: t._onclick_handler(x, y)
                                    except: pass
                            elif hasattr(screen, '_onclick_handler') and screen._onclick_handler:
                                try: screen._onclick_handler(x, y)
                                except: pass
                        elif etype == "mouseup":
                            # Handle onrelease events
                            if tid is not None and tid in screen._turtles:
                                t = screen._turtles[tid]
                                if hasattr(t, '_onrelease_handler') and t._onrelease_handler:
                                    try: t._onrelease_handler(x, y)
                                    except: pass
                            elif hasattr(screen, '_onrelease_handler') and screen._onrelease_handler:
                                try: screen._onrelease_handler(x, y)
                                except: pass
                        elif etype == "drag":
                            # Handle ondrag events
                            if tid is not None and tid in screen._turtles:
                                t = screen._turtles[tid]
                                if hasattr(t, '_ondrag_handler') and t._ondrag_handler:
                                    try: t._ondrag_handler(x, y)
                                    except: pass
                            elif hasattr(screen, '_ondrag_handler') and screen._ondrag_handler:
                                try: screen._ondrag_handler(x, y)
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
        self._tracer_n = 1       # Default: animate every command
        self._tracer_delay = 10  # Default delay in ms
        self._key_handlers = {}
        self._onclick_handler = None
        self._onrelease_handler = None
        self._ondrag_handler = None
        self._mode = "standard"
        self._colormode = 1.0 
        self._turtles = {}
        self._timers = [] 
        self._shapes = ["classic", "arrow", "turtle", "circle", "square", "triangle"]
        self._cmd_count = 0      # Command counter for tracer
        self._stamp_counter = 0  # Global monotonic counter for stamp IDs
        self._title = "Python Turtle Graphics"
        
        # Send INIT (Defaults)
        _send_cmd("INIT", {
            "width": self._width, 
            "height": self._height,
            "mode": self._mode
        })
    
    def _auto_update(self, turtle_speed=None):
        """Handle automatic update based on tracer settings.
        
        Called after each drawing command. If tracer > 0, updates every N commands
        with a delay based on turtle speed and screen delay settings.
        """
        if self._tracer_n == 0:
            # Manual mode - no auto update
            return
        
        self._cmd_count += 1
        
        if self._cmd_count >= self._tracer_n:
            self._cmd_count = 0
            
            # Calculate delay based on speed
            # Speed 0 = fastest (no delay)
            # Speed 1 = slowest, Speed 10 = fast
            # Standard turtle delay formula
            if turtle_speed is None or turtle_speed == 0:
                delay_ms = 0
            elif turtle_speed == 1:
                delay_ms = 200
            elif turtle_speed <= 10:
                # Scale: speed 1=200ms, speed 10=10ms
                delay_ms = max(10, 200 - (turtle_speed - 1) * 21)
            else:
                delay_ms = 0
            
            # Add screen delay
            total_delay = delay_ms + self._tracer_delay
            
            if total_delay > 0:
                time.sleep(total_delay / 1000.0)
            
            # Poll events during animation
            _poll_events()

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
        
        # Performance: tracer(0) disables auto-redraws in frontend (batching)
        # tracer(>0) or tracer(1) enables auto-redraws (standard behavior)
        _send_cmd("SET_AUTO_UPDATE", {"value": self._tracer_n > 0})
        
        if delay is not None: self._tracer_delay = int(delay)

    def update(self):
        _send_cmd("UPDATE", {})
        _poll_events()
        _sync_fs()
        
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
    
    def onrelease(self, fun, btn=1, add=None):
        """Bind fun to mouse button release on canvas."""
        self._onrelease_handler = fun
    
    def ondrag(self, fun, btn=1, add=None):
        """Bind fun to mouse drag on canvas."""
        self._ondrag_handler = fun
    
    def title(self, titlestring):
        """Set the title of the turtle graphics window."""
        self._title = titlestring
        # Note: We can't actually change the browser window title
        # but we store the value for compatibility

    def ontimer(self, fun, t=0):
        expiry = (time.time() * 1000) + t
        self._timers.append((expiry, fun))

    def mainloop(self):
        while True:
            _poll_events()
            self._check_timers()
            _sync_fs()
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
    
    # --- Save/Export ---
    def save(self, filename="turtle_drawing.png", overwrite=False):
        """Save the current drawing as a PNG image.
        
        The image is written to the virtual filesystem and appears in the file explorer.
        """
        # Force update to ensure canvas is fully rendered
        self.update()
        # Send save command
        _send_cmd("SAVE", {"filename": filename})
        # Small delay to allow async message chain to complete
        # This is needed because mainloop() would otherwise block immediately
        time.sleep(0.1)
    
    # --- Mock Canvas for CPython Compatibility ---
    class _MockCanvas:
        """Mock Tkinter canvas that provides postscript() compatibility.
        
        In CPython turtle, you save drawings via:
            canvas = screen.getcanvas()
            canvas.postscript(file="drawing.ps")
        
        This mock class allows the same syntax to work in the browser,
        but produces PNG instead of PostScript.
        """
        def __init__(self, screen):
            self._screen = screen
        
        def postscript(self, file=None, **kwargs):
            """Save canvas as image (PNG instead of PostScript).
            
            Args:
                file: Output filename. If ends with .ps or .eps, 
                      it will be converted to .png automatically.
            """
            if file is None:
                file = "turtle_drawing.png"
            
            # Convert PostScript extensions to PNG
            if file.endswith('.ps') or file.endswith('.eps'):
                file = file.rsplit('.', 1)[0] + '.png'
            elif not file.endswith('.png'):
                file = file + '.png'
            
            self._screen.save(file)
            return file  # Return the actual filename used
    
    def getcanvas(self):
        """Return a mock canvas object for CPython compatibility.
        
        Usage:
            canvas = screen.getcanvas()
            canvas.postscript(file="my_drawing.ps")  # Produces PNG
        """
        return self._MockCanvas(self)
    
    # --- Context Managers ---
    class _FillContext:
        def __init__(self, turtle):
            self.turtle = turtle
        def __enter__(self):
            self.turtle.begin_fill()
            return self.turtle
        def __exit__(self, *args):
            self.turtle.end_fill()
    
    class _PolyContext:
        def __init__(self, turtle):
            self.turtle = turtle
        def __enter__(self):
            self.turtle.begin_poly()
            return self.turtle
        def __exit__(self, *args):
            self.turtle.end_poly()


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
        self._onrelease_handler = None
        self._ondrag_handler = None
        # Polygon recording
        self._poly_path = []
        self._poly_recording = False
        # Shape transforms
        self._tilt_angle = 0.0
        self._shear = 0.0
        # Undo buffer
        self._undo_buffer = []
        self._undo_buffer_size = 100
        
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

    def _record_poly(self):
        """Helper to record the current position if polygon recording is active."""
        if self._poly_recording:
            self._poly_path.append((self._x, self._y))

    # --- Motion ---

    def forward(self, distance):
        screen = getattr(_Screen, '_instance', None)
        tracer_n = screen._tracer_n if screen else 1
        
        # If tracer is 0, do instant move (no animation)
        if tracer_n == 0:
            deg = math.radians(self._heading)
            self._x += distance * math.cos(deg)
            self._y += distance * math.sin(deg)
            self._record_poly()
            _send_cmd("MOVE", {
                "id": self._id, 
                "x": self._x, 
                "y": self._y,
                "pen_down": self._pen_down,
                "color": self._pencolor,
                "width": self._pensize
            })
            return
        
        # Animated movement - break into steps
        # Number of steps based on distance and speed
        # Speed 0 = instant (1 step), Speed 1 = slow (many steps), Speed 10 = fast (fewer steps)
        speed = self._speed if self._speed is not None else 3
        
        if speed == 0:
            # Fastest - single step, no animation
            steps = 1
            step_delay = 0
        else:
            # Calculate steps: more steps = smoother but slower
            # Speed 1 = 1 pixel per step, Speed 10 = 10 pixels per step
            pixels_per_step = max(1, speed)
            steps = max(1, int(abs(distance) / pixels_per_step))
            
            # Delay per step: speed 1 = 15ms, speed 10 = 1ms
            step_delay = max(1, 16 - speed) / 1000.0
        
        # Calculate step size
        deg = math.radians(self._heading)
        dx = distance * math.cos(deg) / steps
        dy = distance * math.sin(deg) / steps
        
        # Animate each step
        for i in range(steps):
            self._x += dx
            self._y += dy
            self._record_poly()
            _send_cmd("MOVE", {
                "id": self._id, 
                "x": self._x, 
                "y": self._y,
                "pen_down": self._pen_down,
                "color": self._pencolor,
                "width": self._pensize
            })
            
            if step_delay > 0 and i < steps - 1:
                time.sleep(step_delay)
                _poll_events()  # Stay responsive during animation
    fd = forward

    def back(self, distance):
        self.forward(-distance)
    bk = backward = back

    def goto(self, x, y=None):
        if y is None: x, y = x
        target_x = float(x)
        target_y = float(y)
        
        # Fast path: check tracer directly (avoid getattr overhead on hot path)
        tracer_n = _Screen._instance._tracer_n if _Screen._instance else 1
        
        # tracer(0) = instant mode, minimal overhead
        if tracer_n == 0:
            self._x = target_x
            self._y = target_y
            self._record_poly()
            _send_cmd("MOVE", {
                "id": self._id, 
                "x": self._x, 
                "y": self._y,
                "pen_down": self._pen_down,
                "color": self._pencolor,
                "width": self._pensize
            })
            return
        
        # Calculate distance (only for animated mode)
        dx = target_x - self._x
        dy = target_y - self._y
        distance = math.sqrt(dx * dx + dy * dy)
        
        # Very short distance - instant move
        if distance < 1:
            self._x = target_x
            self._y = target_y
            _send_cmd("MOVE", {
                "id": self._id, 
                "x": self._x, 
                "y": self._y,
                "pen_down": self._pen_down,
                "color": self._pencolor,
                "width": self._pensize
            })
            return
        
        # Animated movement - break into steps
        speed = self._speed if self._speed is not None else 3
        
        if speed == 0:
            steps = 1
            step_delay = 0
        else:
            pixels_per_step = max(1, speed)
            steps = max(1, int(distance / pixels_per_step))
            step_delay = max(1, 16 - speed) / 1000.0
        
        # Calculate step size
        step_dx = dx / steps
        step_dy = dy / steps
        
        # Animate each step
        for i in range(steps):
            self._x += step_dx
            self._y += step_dy
            self._record_poly()
            _send_cmd("MOVE", {
                "id": self._id, 
                "x": self._x, 
                "y": self._y,
                "pen_down": self._pen_down,
                "color": self._pencolor,
                "width": self._pensize
            })
            
            if step_delay > 0 and i < steps - 1:
                time.sleep(step_delay)
                _poll_events()
        
        # Ensure we end exactly at target
        self._x = target_x
        self._y = target_y
    setpos = setposition = goto
    
    def setx(self, x): self.goto(x, self._y)
    def sety(self, y): self.goto(self._x, y)
    
    def teleport(self, x, y=None, fill_gap=False):
        pd = self._pen_down
        self.penup()
        self.goto(x, y)
        if pd: self.pendown()
        self._record_poly()

    def right(self, angle):
        deg = self._to_degrees(angle)
        
        screen = getattr(_Screen, '_instance', None)
        tracer_n = screen._tracer_n if screen else 1
        speed = self._speed if self._speed is not None else 3
        
        # If tracer is 0 or speed is 0, instant rotation
        if tracer_n == 0 or speed == 0:
            self._heading = (self._heading - deg) % 360
            _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
            return
        
        # Animated rotation - break into steps
        # Speed 1 = 1 degree per step, Speed 10 = 10 degrees per step
        degrees_per_step = max(1, speed * 2)
        steps = max(1, int(abs(deg) / degrees_per_step))
        step_delay = max(1, 16 - speed) / 1000.0
        
        step_angle = deg / steps
        
        for i in range(steps):
            self._heading = (self._heading - step_angle) % 360
            _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
            
            if step_delay > 0 and i < steps - 1:
                time.sleep(step_delay)
    rt = right
    
    def left(self, angle):
        deg = self._to_degrees(angle)
        
        screen = getattr(_Screen, '_instance', None)
        tracer_n = screen._tracer_n if screen else 1
        speed = self._speed if self._speed is not None else 3
        
        # If tracer is 0 or speed is 0, instant rotation
        if tracer_n == 0 or speed == 0:
            self._heading = (self._heading + deg) % 360
            _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
            return
        
        # Animated rotation - break into steps
        degrees_per_step = max(1, speed * 2)
        steps = max(1, int(abs(deg) / degrees_per_step))
        step_delay = max(1, 16 - speed) / 1000.0
        
        step_angle = deg / steps
        
        for i in range(steps):
            self._heading = (self._heading + step_angle) % 360
            _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
            
            if step_delay > 0 and i < steps - 1:
                time.sleep(step_delay)
    lt = left
    
    def setheading(self, to_angle):
        deg = self._to_degrees(to_angle)
        self._heading = deg % 360
        _send_cmd("ROTATE", {"id": self._id, "heading": self._heading})
        # Small delay for visual feedback if tracer > 0
        screen = getattr(_Screen, '_instance', None)
        if screen and screen._tracer_n > 0 and self._speed != 0:
            delay = max(1, 16 - (self._speed or 3)) / 1000.0
            time.sleep(delay)
    seth = setheading
    
    def heading(self):
        return self._from_degrees(self._heading)

    def home(self):
        self.goto(0, 0)
        self.setheading(0)
    
    def circle(self, radius, extent=None, steps=None):
        """Draw a circle or arc with the given radius.
        
        The circle is drawn to the left of the turtle (counterclockwise for positive radius).
        After the arc, the turtle's position and heading are updated.
        
        Animation: When speed > 0 and tracer > 0, the arc is drawn as a series of
        line segments with delays, matching the behavior of forward().
        """
        
        if extent is None:
            extent = 360
        
        # Convert extent to degrees
        ext_deg = float(extent)
        
        # Determine if we should animate
        screen = getattr(_Screen, '_instance', None)
        tracer_n = screen._tracer_n if screen else 1
        speed = self._speed if self._speed is not None else 3
        
        # Calculate arc geometry
        heading_rad = math.radians(self._heading)
        
        if radius >= 0:
            center_angle = heading_rad + math.pi / 2
        else:
            center_angle = heading_rad - math.pi / 2
            
        cx = self._x + abs(radius) * math.cos(center_angle)
        cy = self._y + abs(radius) * math.sin(center_angle)
        start_angle = math.atan2(self._y - cy, self._x - cx)
        
        # FAST PATH: Instant drawing (use CIRCLE command for efficiency)
        if tracer_n == 0 or speed == 0:
            ext_rad = math.radians(ext_deg)
            if radius >= 0:
                end_angle = start_angle + ext_rad
            else:
                end_angle = start_angle - ext_rad
                
            new_x = cx + abs(radius) * math.cos(end_angle)
            new_y = cy + abs(radius) * math.sin(end_angle)
            
            _send_cmd("CIRCLE", {
                "id": self._id,
                "radius": float(radius),
                "extent": ext_deg,
                "steps": steps or 0,
                "pen_down": self._pen_down,
                "filling": self._filling,
                "fillcolor": self._fillcolor,
                "start_x": self._x,
                "start_y": self._y,
                "end_x": new_x,
                "end_y": new_y
            })
            
            self._x = new_x
            self._y = new_y
            self._record_poly()
            if radius >= 0:
                self._heading = (self._heading + ext_deg) % 360
            else:
                self._heading = (self._heading - ext_deg) % 360
            return

        # ANIMATED PATH: Draw as line segments using MOVE commands
        # This creates smooth animation that matches forward() behavior
        
        # Calculate number of segments based on arc length and speed
        arc_length = abs(radius * math.radians(ext_deg))
        
        # Pixels per step: higher speed = larger steps = fewer segments
        pixels_per_step = max(1, speed)
        num_steps = max(4, int(arc_length / pixels_per_step))  # At least 4 segments
        
        # Limit maximum steps to prevent lag on huge arcs
        num_steps = min(num_steps, 200)
        
        # Animation delay per step
        step_delay = max(1, 16 - speed) / 1000.0
        
        # Angular step
        angle_step = math.radians(ext_deg) / num_steps
        
        current_arc_angle = start_angle
        
        for i in range(num_steps):
            # Calculate next position on the arc
            if radius >= 0:
                current_arc_angle += angle_step
            else:
                current_arc_angle -= angle_step
                
            new_x = cx + abs(radius) * math.cos(current_arc_angle)
            new_y = cy + abs(radius) * math.sin(current_arc_angle)
            
            # Track fill path
            if self._filling:
                # Add point to fill path via extended MOVE
                pass  # Fill path tracking is handled by MOVE command on frontend
            
            # Send as MOVE (line segment) - this is the key change!
            _send_cmd("MOVE", {
                "id": self._id,
                "x": new_x,
                "y": new_y,
                "pen_down": self._pen_down,
                "color": self._pencolor,
                "width": self._pensize
            })
            
            self._x = new_x
            self._y = new_y
            self._record_poly()
            
            # Update heading progressively
            heading_step = ext_deg / num_steps
            if radius >= 0:
                self._heading = (self._heading + heading_step) % 360
            else:
                self._heading = (self._heading - heading_step) % 360
            
            # Animation delay (skip on last step)
            if i < num_steps - 1:
                time.sleep(step_delay)
                _poll_events()
        
        # Ensure final heading is exactly correct (avoid floating point drift)
        # Already updated incrementally above

    def _draw_arc_segment(self, radius, extent):
        """Helper to draw a single arc segment instantly (used for tracer(0) mode)"""
        import math
        
        ext_rad = math.radians(extent)
        heading_rad = math.radians(self._heading)
        
        if radius >= 0:
            center_angle = heading_rad + math.pi / 2
        else:
            center_angle = heading_rad - math.pi / 2
            
        cx = self._x + abs(radius) * math.cos(center_angle)
        cy = self._y + abs(radius) * math.sin(center_angle)
        
        start_angle = math.atan2(self._y - cy, self._x - cx)
        
        if radius >= 0:
            end_angle = start_angle + ext_rad
        else:
            end_angle = start_angle - ext_rad
            
        new_x = cx + abs(radius) * math.cos(end_angle)
        new_y = cy + abs(radius) * math.sin(end_angle)
        
        _send_cmd("CIRCLE", {
            "id": self._id,
            "radius": float(radius),
            "extent": extent,
            "steps": 0,
            "pen_down": self._pen_down,
            "filling": self._filling,
            "fillcolor": self._fillcolor,
            "start_x": self._x,
            "start_y": self._y,
            "end_x": new_x,
            "end_y": new_y
        })
        
        self._x = new_x
        self._y = new_y
        
        if radius >= 0:
            self._heading = (self._heading + extent) % 360
        else:
            self._heading = (self._heading - extent) % 360

    def stamp(self):
        screen = getattr(_Screen, '_instance', None)
        if screen:
            screen._stamp_counter += 1
            stamp_id = screen._stamp_counter
        else:
            # Fallback if screen missing (unlikely)
            stamp_id = int(time.time() * 1000)
            
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
                "shearfactor": self._shear,
                "outline": self._outline,
                "tilt": self._tilt_angle
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
    
    def filling(self):
        """Return fillstate (True if filling, False else)."""
        return self._filling
        
    def onclick(self, fun, btn=1, add=None):
        self._onclick_handler = fun
    
    def onrelease(self, fun, btn=1, add=None):
        """Bind fun to mouse button release on this turtle."""
        self._onrelease_handler = fun
        
    def ondrag(self, fun, btn=1, add=None):
        """Bind fun to mouse-move-event on this turtle."""
        self._ondrag_handler = fun

    # --- State ---

    def shape(self, name=None):
        if name is None: return self._shape
        self._shape = name
        _send_cmd("UPDATE_TURTLE", {"id": self._id, "shape": name})
    
    def speed(self, speed=None):
        if speed is None: return self._speed
        # Handle speed strings (standard turtle aliases)
        if isinstance(speed, str):
            speed = {"fastest": 0, "fast": 10, "normal": 6, "slow": 3, "slowest": 1}.get(speed.lower(), 3)
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
    def position(self): return Vec2D(self._x, self._y)
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
        """Clear the turtle's drawings from the screen.
        
        The turtle itself is not affected (position, heading, visibility remain unchanged).
        """
        _send_cmd("CLEAR", {"id": self._id})
        
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

    def settiltangle(self, angle=None):
        """Set or return the current tilt-angle."""
        if angle is None: return self._tilt_angle
        self._tilt_angle = float(angle) % 360
    
    def tiltangle(self, angle=None):
        """Set or return the current tilt-angle."""
        if angle is None: return self._tilt_angle
        self._tilt_angle = float(angle) % 360
    
    def tilt(self, angle):
        """Rotate the turtleshape by angle."""
        self._tilt_angle = (self._tilt_angle + float(angle)) % 360
    
    def shapetransform(self, t11=None, t12=None, t21=None, t22=None):
        """Set or return the current transformation matrix."""
        if t11 is None:
            c = math.cos(math.radians(self._tilt_angle))
            s = math.sin(math.radians(self._tilt_angle))
            return (self._stretch_len * c, self._stretch_len * s + self._shear * self._stretch_wid,
                    -self._stretch_wid * s, self._stretch_wid * c)
        # Setting is not fully implemented but we accept the call
        return (1, 0, 0, 1)
    
    def shearfactor(self, shear=None):
        """Set or return the current shearfactor."""
        if shear is None: return self._shear
        self._shear = float(shear)
    
    def get_shapepoly(self):
        """Return the current shape polygon as tuple of coordinate pairs."""
        # Return basic shape polygon (classic arrow)
        return ((0, 0), (-10, 4), (-7, 0), (-10, -4))
    
    def begin_poly(self):
        """Start recording vertices of polygon."""
        self._poly_recording = True
        self._poly_path = [(self._x, self._y)]
    
    def end_poly(self):
        """Stop recording vertices of polygon."""
        self._poly_recording = False
        if self._poly_path:
            self._poly_path.append((self._x, self._y))
    
    def get_poly(self):
        """Return last recorded polygon."""
        if self._poly_path:
            return tuple(self._poly_path)
        return ((0, 0),)
    
    def fill(self):
        """Context manager for filling shapes."""
        return _Screen._FillContext(self)
    
    def poly(self):
        """Context manager for polygon recording."""
        return _Screen._PolyContext(self)
    
    def getturtle(self): return self
    def getpen(self): return self
    def getscreen(self): return Screen()
    
    def undo(self):
        """Undo last turtle action (limited implementation)."""
        # Not fully implemented - would require storing command history
        pass
    
    def setundobuffer(self, size):
        """Set size of undobuffer."""
        if size is None:
            self._undo_buffer = []
            self._undo_buffer_size = 0
        else:
            self._undo_buffer_size = int(size)
    
    def undobufferentries(self):
        """Return count of entries in undobuffer."""
        return len(self._undo_buffer)

# ===== Class Aliases (CPython Compatibility) =====
# These provide standard turtle module class names
RawTurtle = Turtle
RawPen = Turtle
Pen = Turtle

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
def filling(): return _get_turtle().filling()
def begin_poly(): _get_turtle().begin_poly()
def end_poly(): _get_turtle().end_poly()
def get_poly(): return _get_turtle().get_poly()

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
def resizemode(r=None): return _get_turtle().resizemode(r)
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
def mode(m=None): return Screen().mode(m)
def title(T): Screen().title(T)
def save(filename="turtle_drawing.png", overwrite=False): Screen().save(filename, overwrite)
def getcanvas(): return Screen().getcanvas()
def towards(x, y=None): return _get_turtle().towards(x, y)
def isdown(): return _get_turtle().isdown()
def pen(p=None, **kw): return _get_turtle().pen(p, **kw)
def setundobuffer(s): _get_turtle().setundobuffer(s)
def undobufferentries(): return _get_turtle().undobufferentries()
