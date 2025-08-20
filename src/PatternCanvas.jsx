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
  const containerRef = useRef(null); // ✅ Add container ref
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [timestamps, setTimestamps] = useState([]);
  const [stats, setStats] = useState(null);

  const getCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  }, []);

  const startDrawing = useCallback((e) => {
    if (disabled) return;
    
    // ✅ Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const newPoints = [coords];
    const newTimestamps = [Date.now()];
    
    setPoints(newPoints);
    setTimestamps(newTimestamps);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
  }, [disabled, getCoordinates]);

  const draw = useCallback((e) => {
    if (!isDrawing || disabled) return;
    
    // ✅ Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCoordinates(e);
    const newPoints = [...points, coords];
    const newTimestamps = [...timestamps, Date.now()];
    
    setPoints(newPoints);
    setTimestamps(newTimestamps);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [isDrawing, disabled, points, timestamps, getCoordinates]);

  const stopDrawing = useCallback((e) => {
    if (!isDrawing) return;
    
    // ✅ Prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsDrawing(false);
    
    if (points.length > 1) {
      const totalTime = timestamps[timestamps.length - 1] - timestamps[0];
      const newStats = {
        pointCount: points.length,
        totalTime,
        avgSpeed: points.length / (totalTime / 1000)
      };
      setStats(newStats);
      
      onPatternChange?.({
        points,
        timestamps,
        stats: newStats
      });
    }
  }, [isDrawing, points, timestamps, onPatternChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setPoints([]);
    setTimestamps([]);
    setStats(null);
    onPatternChange?.(null);
  }, [onPatternChange]);

  // ✅ Prevent scrolling/zooming on the container
  const preventDefaultTouch = useCallback((e) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ✅ Add touch event options
    const touchOptions = { passive: false };
    const mouseOptions = { passive: false };

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing, mouseOptions);
    canvas.addEventListener('mousemove', draw, mouseOptions);
    canvas.addEventListener('mouseup', stopDrawing, mouseOptions);
    canvas.addEventListener('mouseleave', stopDrawing, mouseOptions); // Changed from mouseout
    canvas.addEventListener('mouseout', stopDrawing, mouseOptions);

    // Touch events with proper options
    canvas.addEventListener('touchstart', startDrawing, touchOptions);
    canvas.addEventListener('touchmove', draw, touchOptions);
    canvas.addEventListener('touchend', stopDrawing, touchOptions);
    canvas.addEventListener('touchcancel', stopDrawing, touchOptions);

    // ✅ Prevent default touch behaviors on container
    container.addEventListener('touchstart', preventDefaultTouch, touchOptions);
    container.addEventListener('touchmove', preventDefaultTouch, touchOptions);
    container.addEventListener('touchend', preventDefaultTouch, touchOptions);

    // ✅ Prevent context menu on long press
    canvas.addEventListener('contextmenu', preventDefaultTouch);

    return () => {
      // Cleanup mouse events
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);

      // Cleanup touch events
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);

      // Cleanup container events
      container.removeEventListener('touchstart', preventDefaultTouch);
      container.removeEventListener('touchmove', preventDefaultTouch);
      container.removeEventListener('touchend', preventDefaultTouch);
      canvas.removeEventListener('contextmenu', preventDefaultTouch);
    };
  }, [startDrawing, draw, stopDrawing, preventDefaultTouch]);

  return (
    <Box 
      ref={containerRef} // ✅ Add container ref
      sx={{
        // ✅ Prevent touch behaviors
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '2px dashed #cbd5e1',
          position: 'relative',
          display: 'inline-block',
          // ✅ Additional touch prevention
          touchAction: 'none',
          userSelect: 'none'
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
            // ✅ Prevent touch issues on button
            sx={{ touchAction: 'manipulation' }}
          >
            <ClearIcon />
          </IconButton>
        </Box>

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            display: 'block',
            // ✅ Critical CSS for touch prevention
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
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
          sx={{ 
            mt: 2, 
            borderRadius: 2,
            // ✅ Prevent touch issues on alert
            touchAction: 'manipulation'
          }}
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
