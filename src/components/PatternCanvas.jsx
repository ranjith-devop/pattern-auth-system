import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Clear as ClearIcon,
  TouchApp as TouchIcon
} from '@mui/icons-material';

const PatternCanvas = ({
  onPatternChange,
  width = 400,
  height = 300,
  disabled = false,
  showStats = false
}) => {
  const canvasRef = useRef(null);

  // keep transient drawing data in refs to avoid re-renders while drawing
  const isDrawingRef = useRef(false);
  const pointsRef = useRef([]);        // {x, y}
  const timestampsRef = useRef([]);    // ms timestamps
  const ctxRef = useRef(null);
  const dprRef = useRef(1);

  // state only for UI / final data
  const [points, setPoints] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [stats, setStats] = useState(null);

  // setup canvas size with devicePixelRatio and context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    // actual pixel size
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // CSS size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    // scale so drawing commands use CSS pixels (1 unit = 1 CSS pixel)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // initial style
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6366f1';
    ctx.fillStyle = '#6366f1';

    ctxRef.current = ctx;

    const handleWindowResize = () => {
      // if you want crisp resizing on resize, re-run sizing logic.
      // We preserve contents (optional) — for simplicity we clear on resize.
      // (Resizing while the user draws is unlikely; avoid doing it frequently.)
      canvas.width = Math.round(width * (window.devicePixelRatio || 1));
      canvas.height = Math.round(height * (window.devicePixelRatio || 1));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      // reapply styles
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#6366f1';
      ctx.fillStyle = '#6366f1';
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [width, height]);

  // Helper: get coordinates in CSS pixel space (we scaled ctx so coords are CSS px)
  const getCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    // pointer events have clientX/clientY; fallback to touches for older touch events if any
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches[0]) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((e) => {
    if (disabled) return;
    // prevent page scroll / selection
    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);

    // prepare refs for drawing session
    isDrawingRef.current = true;
    pointsRef.current = [coords];
    timestampsRef.current = [Date.now()];

    // draw initial dot and begin path
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.arc(coords.x, coords.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath(); // start fresh path for lines
    ctx.moveTo(coords.x, coords.y);
  }, [disabled, getCoordinates]);

  // Draw on pointer move
  const draw = useCallback((e) => {
    if (!isDrawingRef.current || disabled) return;
    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    const now = Date.now();

    // append to refs (no setState here)
    pointsRef.current.push(coords);
    timestampsRef.current.push(now);

    // draw a line from last point to new point
    const ctx = ctxRef.current;
    if (!ctx) return;
    // moveTo last known position then lineTo new position
    // since we always keep path open, just lineTo works
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [disabled, getCoordinates]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    // publish final points/timestamps to state once (triggers re-render but done after drawing)
    const finalPoints = [...pointsRef.current];
    const finalTimestamps = [...timestampsRef.current];

    setPoints(finalPoints);
    setTimestamps(finalTimestamps);

    if (finalPoints.length > 1) {
      const totalTime = finalTimestamps[finalTimestamps.length - 1] - finalTimestamps[0];
      const newStats = {
        pointCount: finalPoints.length,
        totalTime,
        avgSpeed: finalPoints.length / (totalTime / 1000 || 1)
      };
      setStats(newStats);

      onPatternChange?.({
        points: finalPoints,
        timestamps: finalTimestamps,
        stats: newStats
      });
    } else {
      setStats(null);
      onPatternChange?.(null);
    }
  }, [onPatternChange]);

  // Wire pointer events (pointerdown/pointermove) and ensure pointerup is listened on window
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // pointer events: works for mouse + touch + pen
    const handlePointerDown = (e) => startDrawing(e);
    const handlePointerMove = (e) => draw(e);
    const handlePointerUp = (e) => {
      // preventDefault if possible
      if (e.cancelable) e.preventDefault();
      stopDrawing();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    // pointermove on document is heavy; keep on canvas to reduce noise
    canvas.addEventListener('pointermove', handlePointerMove);

    // pointerup might occur outside canvas so listen on window
    window.addEventListener('pointerup', handlePointerUp);

    // For older browsers that might use touch events (rare with pointer support),
    // also attach non-passive touch handlers as fallback:
    const handleTouchStart = (e) => startDrawing(e);
    const handleTouchMove = (e) => draw(e);
    const handleTouchEnd = (e) => stopDrawing();

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    // disable context menu on canvas long-press
    const handleContext = (ev) => ev.preventDefault();
    canvas.addEventListener('contextmenu', handleContext);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      canvas.removeEventListener('contextmenu', handleContext);
    };
  }, [startDrawing, draw, stopDrawing]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // reset transform after clear (we scaled ctx earlier)
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
      // reapply styles
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#6366f1';
      ctx.fillStyle = '#6366f1';
    }

    // reset refs + state
    pointsRef.current = [];
    timestampsRef.current = [];
    setPoints([]);
    setTimestamps([]);
    setStats(null);
    onPatternChange?.(null);
  }, [onPatternChange]);

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '2px dashed #cbd5e1',
          position: 'relative',
          display: 'inline-block'
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TouchIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              Draw your unique pattern
            </Typography>
          </Box>
          <IconButton
            onClick={clearCanvas}
            disabled={disabled || points.length === 0}
            size="small"
            color="error"
          >
            <ClearIcon />
          </IconButton>
        </Box>

        <canvas
          ref={canvasRef}
          // keep attributes minimal; we size the canvas in effect above
          width={width}
          height={height}
          style={{
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            display: 'block',
            touchAction: 'none', // important to prevent default gestures
            WebkitUserSelect: 'none',
            userSelect: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />

        {showStats && stats && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${stats.pointCount} points`}
                size="small"
                color="primary"
              />
              <Chip
                label={`${(stats.totalTime / 1000).toFixed(1)}s`}
                size="small"
                color="secondary"
              />
              <Chip
                label={`${stats.avgSpeed.toFixed(1)} pts/s`}
                size="small"
                color="success"
              />
            </Stack>
          </Box>
        )}
      </Paper>

      {points.length === 0 && (
        <Alert
          severity="info"
          sx={{ mt: 2, borderRadius: 2 }}
        >
          <Typography variant="body2">
            Draw a unique pattern that you can remember. This will be your signature for authentication.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default PatternCanvas;
