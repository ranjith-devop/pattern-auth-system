import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  Stack
} from '@mui/material';
import { EmojiEmotions as EmojiIcon } from '@mui/icons-material';

const EMOJI_CATEGORIES = {
  faces: ['😀', '😃', '😄', '😁', '😆', '🥹', '😅', '😂', '🤣', '🥲', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '☺️', '😚', '😙', '🥳', '😎', '🤩'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦆', '🐧', '🐦', '🐤', '🐣'],
  food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥕', '🌽', '🌶️', '🫒', '🥒', '🥬'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊'],
  objects: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠']
};

const EmojiSelector = ({ onEmojiChange, selectedEmojis = [], title = "Select 3 Emojis", required = true }) => {
  const [activeCategory, setActiveCategory] = useState('faces');

  const handleEmojiClick = (emoji) => {
    if (selectedEmojis.includes(emoji)) {
      // Remove emoji if already selected
      const newEmojis = selectedEmojis.filter(e => e !== emoji);
      onEmojiChange(newEmojis);
    } else if (selectedEmojis.length < 3) {
      // Add emoji if less than 3 selected
      const newEmojis = [...selectedEmojis, emoji];
      onEmojiChange(newEmojis);
    }
  };

  const clearSelection = () => {
    onEmojiChange([]);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '2px dashed #cbd5e1'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <EmojiIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Choose exactly 3 emojis for your secondary authentication
        </Typography>
      </Box>

      {/* Selected Emojis Display */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Selected ({selectedEmojis.length}/3):
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {selectedEmojis.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No emojis selected yet...
            </Typography>
          ) : (
            selectedEmojis.map((emoji, index) => (
              <Chip
                key={index}
                label={`${index + 1}. ${emoji}`}
                onDelete={() => handleEmojiClick(emoji)}
                sx={{ fontSize: '1.2rem' }}
                color="primary"
              />
            ))
          )}
          {selectedEmojis.length > 0 && (
            <Button size="small" onClick={clearSelection} color="error">
              Clear All
            </Button>
          )}
        </Stack>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <Button
              key={category}
              size="small"
              variant={activeCategory === category ? 'contained' : 'outlined'}
              onClick={() => setActiveCategory(category)}
              sx={{ textTransform: 'capitalize', minWidth: 'auto' }}
            >
              {category}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Emoji Grid */}
      <Box
        sx={{
          maxHeight: 300,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          p: 2,
          bgcolor: 'white'
        }}
      >
        <Grid container spacing={1}>
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <Grid item xs={2} sm={1.5} md={1} key={index}>
              <Button
                fullWidth
                onClick={() => handleEmojiClick(emoji)}
                sx={{
                  minWidth: 'auto',
                  aspectRatio: '1/1',
                  fontSize: '1.5rem',
                  p: 0.5,
                  bgcolor: selectedEmojis.includes(emoji) ? 'primary.light' : 'transparent',
                  border: selectedEmojis.includes(emoji) ? '2px solid' : '1px solid transparent',
                  borderColor: selectedEmojis.includes(emoji) ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                disabled={selectedEmojis.length >= 3 && !selectedEmojis.includes(emoji)}
              >
                {emoji}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Status Messages */}
      {selectedEmojis.length === 3 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Perfect! You've selected 3 emojis for secondary authentication.
        </Alert>
      )}

      {required && selectedEmojis.length < 3 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select {3 - selectedEmojis.length} more emoji{3 - selectedEmojis.length > 1 ? 's' : ''}.
        </Alert>
      )}
    </Paper>
  );
};

export default EmojiSelector;
