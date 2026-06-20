import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ *
 * AnimatedCharacters — cursor-tracking sculptural shapes for the auth
 * brand panel. Ported from a shadcn/Tailwind demo to plain JSX + inline
 * styles and recolored into the Tibr charcoal/gold palette.
 *
 * Reactions are driven by props lifted from the login form:
 *   isTyping       — email field is focused → characters glance at each other
 *   passwordLength — > 0 makes the back pair lean in to "read along"
 *   showPassword   — when true the front shapes look away / cover; the
 *                    back shape occasionally peeks at the revealed password
 * ------------------------------------------------------------------ */

/* A bare pupil (no white), used for the lighter accent shapes. */
function Pupil({ size = 12, maxDistance = 5, pupilColor = "#1a1a1a", forceLookX, forceLookY }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pos = (() => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * dist, y: Math.sin(a) * dist };
  })();

  return (
    <div
      ref={ref}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
}

/* A white eyeball with a dark pupil that tracks the cursor; can blink. */
function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "#f4f1ea",
  pupilColor = "#1a1a1a",
  isBlinking = false,
  forceLookX,
  forceLookY,
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pos = (() => {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 2);
    const dist = Math.min(Math.hypot(dx, dy), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * dist, y: Math.sin(a) * dist };
  })();

  return (
    <div
      ref={ref}
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        borderRadius: "50%",
        backgroundColor: eyeColor,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
      }}
    >
      {!isBlinking && (
        <div
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            borderRadius: "50%",
            backgroundColor: pupilColor,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
}

/* Brand palette — charcoal/graphite shapes with a single gold accent. */
const C = {
  graphite: "#2b2b31", // tall back shape
  ink: "#1c1c20", // mid shape
  gold: "#c9a24c", // accent semi-circle (the one warm shape)
  sand: "#b9a877", // muted gold-sand front shape
  pupil: "#1a1a1a",
  white: "#f4f1ea",
};

export default function AnimatedCharacters({ isTyping = false, passwordLength = 0, showPassword = false }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [purpleBlink, setPurpleBlink] = useState(false);
  const [blackBlink, setBlackBlink] = useState(false);
  const [lookEachOther, setLookEachOther] = useState(false);
  const [peeking, setPeeking] = useState(false);

  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  const hasPw = passwordLength > 0;
  const reading = isTyping || (hasPw && !showPassword);
  const covering = hasPw && showPassword;

  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Independent random blink loops for the two dark shapes.
  useEffect(() => {
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        setPurpleBlink(true);
        setTimeout(() => {
          setPurpleBlink(false);
          schedule();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        setBlackBlink(true);
        setTimeout(() => {
          setBlackBlink(false);
          schedule();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Quick "glance at each other" when the user starts typing.
  useEffect(() => {
    if (!isTyping) {
      setLookEachOther(false);
      return;
    }
    setLookEachOther(true);
    const t = setTimeout(() => setLookEachOther(false), 800);
    return () => clearTimeout(t);
  }, [isTyping]);

  // Sneaky peek loop while the password is revealed.
  useEffect(() => {
    if (!covering) {
      setPeeking(false);
      return;
    }
    const t = setTimeout(() => {
      setPeeking(true);
      setTimeout(() => setPeeking(false), 800);
    }, Math.random() * 3000 + 2000);
    return () => clearTimeout(t);
  }, [covering, peeking]);

  const posFor = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mouse.x - (r.left + r.width / 2);
    const dy = mouse.y - (r.top + r.height / 3);
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const purple = posFor(purpleRef);
  const black = posFor(blackRef);
  const yellow = posFor(yellowRef);
  const orange = posFor(orangeRef);

  return (
    <div className="auth-chars">
      <div className="auth-chars__stage">
        {/* Tall back shape (graphite) */}
        <div
          ref={purpleRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: "70px",
            width: "180px",
            height: reading ? "440px" : "400px",
            backgroundColor: C.graphite,
            borderRadius: "10px 10px 0 0",
            zIndex: 1,
            transformOrigin: "bottom center",
            transition: "all 0.7s ease-in-out",
            transform: covering
              ? "skewX(0deg)"
              : reading
                ? `skewX(${purple.bodySkew - 12}deg) translateX(40px)`
                : `skewX(${purple.bodySkew}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              display: "flex",
              gap: "32px",
              transition: "all 0.7s ease-in-out",
              left: covering ? "20px" : lookEachOther ? "55px" : `${45 + purple.faceX}px`,
              top: covering ? "35px" : lookEachOther ? "65px" : `${40 + purple.faceY}px`,
            }}
          >
            {[0, 1].map((i) => (
              <EyeBall
                key={i}
                size={18}
                pupilSize={7}
                maxDistance={5}
                eyeColor={C.white}
                pupilColor={C.pupil}
                isBlinking={purpleBlink}
                forceLookX={covering ? (peeking ? 4 : -4) : lookEachOther ? 3 : undefined}
                forceLookY={covering ? (peeking ? 5 : -4) : lookEachOther ? 4 : undefined}
              />
            ))}
          </div>
        </div>

        {/* Mid shape (ink) */}
        <div
          ref={blackRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: "240px",
            width: "120px",
            height: "310px",
            backgroundColor: C.ink,
            borderRadius: "8px 8px 0 0",
            zIndex: 2,
            transformOrigin: "bottom center",
            transition: "all 0.7s ease-in-out",
            transform: covering
              ? "skewX(0deg)"
              : lookEachOther
                ? `skewX(${black.bodySkew * 1.5 + 10}deg) translateX(20px)`
                : reading
                  ? `skewX(${black.bodySkew * 1.5}deg)`
                  : `skewX(${black.bodySkew}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              display: "flex",
              gap: "24px",
              transition: "all 0.7s ease-in-out",
              left: covering ? "10px" : lookEachOther ? "32px" : `${26 + black.faceX}px`,
              top: covering ? "28px" : lookEachOther ? "12px" : `${32 + black.faceY}px`,
            }}
          >
            {[0, 1].map((i) => (
              <EyeBall
                key={i}
                size={16}
                pupilSize={6}
                maxDistance={4}
                eyeColor={C.white}
                pupilColor={C.pupil}
                isBlinking={blackBlink}
                forceLookX={covering ? -4 : lookEachOther ? 0 : undefined}
                forceLookY={covering ? -4 : lookEachOther ? -4 : undefined}
              />
            ))}
          </div>
        </div>

        {/* Front-left semi-circle (gold accent) */}
        <div
          ref={orangeRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: "0px",
            width: "240px",
            height: "200px",
            backgroundColor: C.gold,
            borderRadius: "120px 120px 0 0",
            zIndex: 3,
            transformOrigin: "bottom center",
            transition: "all 0.7s ease-in-out",
            transform: covering ? "skewX(0deg)" : `skewX(${orange.bodySkew}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              display: "flex",
              gap: "32px",
              transition: "all 0.2s ease-out",
              left: covering ? "50px" : `${82 + orange.faceX}px`,
              top: covering ? "85px" : `${90 + orange.faceY}px`,
            }}
          >
            <Pupil size={12} maxDistance={5} pupilColor={C.pupil} forceLookX={covering ? -5 : undefined} forceLookY={covering ? -4 : undefined} />
            <Pupil size={12} maxDistance={5} pupilColor={C.pupil} forceLookX={covering ? -5 : undefined} forceLookY={covering ? -4 : undefined} />
          </div>
        </div>

        {/* Front-right shape (muted sand) */}
        <div
          ref={yellowRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: "310px",
            width: "140px",
            height: "230px",
            backgroundColor: C.sand,
            borderRadius: "70px 70px 0 0",
            zIndex: 4,
            transformOrigin: "bottom center",
            transition: "all 0.7s ease-in-out",
            transform: covering ? "skewX(0deg)" : `skewX(${yellow.bodySkew}deg)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              display: "flex",
              gap: "24px",
              transition: "all 0.2s ease-out",
              left: covering ? "20px" : `${52 + yellow.faceX}px`,
              top: covering ? "35px" : `${40 + yellow.faceY}px`,
            }}
          >
            <Pupil size={12} maxDistance={5} pupilColor={C.pupil} forceLookX={covering ? -5 : undefined} forceLookY={covering ? -4 : undefined} />
            <Pupil size={12} maxDistance={5} pupilColor={C.pupil} forceLookX={covering ? -5 : undefined} forceLookY={covering ? -4 : undefined} />
          </div>
          {/* Mouth */}
          <div
            style={{
              position: "absolute",
              width: "80px",
              height: "4px",
              backgroundColor: C.pupil,
              borderRadius: "999px",
              transition: "all 0.2s ease-out",
              left: covering ? "10px" : `${40 + yellow.faceX}px`,
              top: covering ? "88px" : `${88 + yellow.faceY}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
