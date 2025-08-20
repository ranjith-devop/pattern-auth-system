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
    
    e.preventDefault();
  }, [disabled, getCoordinates]);

  const draw = useCallback((e) => {
    if (!isDrawing || disabled) return;
    
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
    
    e.preventDefault();
  }, [isDrawing, disabled, points, timestamps, getCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);

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
          width={width}
          height={height}
          style={{
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            display: 'block',
            touchAction: 'none',
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
