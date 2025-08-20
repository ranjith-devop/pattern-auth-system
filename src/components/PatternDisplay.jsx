import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const PatternDisplay = ({ 
  patternData, 
  title = "Pattern Visualization",
  width = 300, 
  height = 200,
  showControls = true,
  showStats = false,
  autoPlay = false 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  const drawStaticPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas || !patternData?.points) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = patternData.points;
    if (points.length === 0) return;

    // Draw the complete pattern
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw start point
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    // Draw end point
    if (points.length > 1) {
      ctx.beginPath();
      ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }
  };

  const animatePattern = () => {
    if (!patternData?.points) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const points = patternData.points;

    let frame = 0;
    const animate = () => {
      if (frame >= points.length || !isPlaying) {
        if (frame >= points.length) {
          setIsPlaying(false);
          setCurrentFrame(0);
        }
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the path up to current frame
      if (frame > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i <= frame; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Draw current point
      const currentPoint = points[frame];
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ec4899';
      ctx.fill();

      setCurrentFrame(frame);
      frame++;

      animationRef.current = setTimeout(animate, 100);
    };

    animate();
  };

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    } else {
      setIsPlaying(true);
      animatePattern();
    }
  };

  const handleReplay = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    animatePattern();
  };

  useEffect(() => {
    if (!isPlaying) {
      drawStaticPattern();
    }
  }, [patternData, isPlaying]);

  useEffect(() => {
    if (autoPlay && patternData?.points?.length > 0) {
      setTimeout(handlePlay, 1000);
    }
  }, [autoPlay, patternData]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  if (!patternData || !patternData.points || patternData.points.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
        <InfoIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          No pattern data to display
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
        </Box>

        {showControls && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                <IconButton onClick={handlePlay} color="primary">
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Replay">
                <IconButton onClick={handleReplay} color="secondary">
                  <ReplayIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            {!isPlaying && currentFrame > 0 && (
              <Typography variant="caption" color="text.secondary">
                Frame: {currentFrame} / {patternData.points.length}
              </Typography>
            )}
          </Box>
        )}

        {showStats && patternData.stats && (
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            <Chip 
              label={`${patternData.points.length} points`}
              size="small"
              color="primary"
            />
            <Chip 
              label={`${(patternData.stats.totalTime / 1000).toFixed(1)}s`}
              size="small"
              color="secondary"
            />
          </Stack>
        )}

        {/* Legend */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="caption">Start</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
              <Typography variant="caption">End</Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default PatternDisplay;
