export class PatternUtils {
  static calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static calculateSpeed(points, timestamps) {
    if (points.length < 2) return [];
    
    const speeds = [];
    for (let i = 1; i < points.length; i++) {
      const distance = this.calculateDistance(points[i-1], points[i]);
      const timeDiff = timestamps[i] - timestamps[i-1];
      speeds.push(timeDiff > 0 ? distance / timeDiff : 0);
    }
    return speeds;
  }

  static normalizePattern(points) {
    if (points.length === 0) return [];
    
    // Find bounding box
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Prevent division by zero
    if (width === 0 && height === 0) return points;
    
    const scale = 100 / Math.max(width, height, 1);
    
    return points.map(point => ({
      x: (point.x - minX) * scale,
      y: (point.y - minY) * scale
    }));
  }

  // REDUCED ACCURACY - More lenient pattern matching
  static comparePatterns(pattern1, pattern2, tolerance = 70) {
    if (!pattern1 || !pattern2 || !pattern1.points || !pattern2.points) {
      return { similarity: 0, isMatch: false };
    }

    const points1 = pattern1.points;
    const points2 = pattern2.points;

    if (points1.length === 0 || points2.length === 0) {
      return { similarity: 0, isMatch: false };
    }

    // Normalize both patterns
    const norm1 = this.normalizePattern(points1);
    const norm2 = this.normalizePattern(points2);

    // Simple comparison with HIGH tolerance
    let totalDistance = 0;
    const minLength = Math.min(norm1.length, norm2.length);
    const maxLength = Math.max(norm1.length, norm2.length);
    
    // VERY lenient length difference penalty
    const lengthPenalty = Math.abs(norm1.length - norm2.length) / maxLength * 20; // Reduced from 50
    
    // Sample points for comparison (reduces accuracy)
    const sampleRate = Math.max(1, Math.floor(minLength / 20)); // Sample fewer points
    let sampleCount = 0;
    
    for (let i = 0; i < minLength; i += sampleRate) {
      const idx1 = Math.floor(i * norm1.length / minLength);
      const idx2 = Math.floor(i * norm2.length / minLength);
      totalDistance += this.calculateDistance(norm1[idx1], norm2[idx2]);
      sampleCount++;
    }

    const avgDistance = sampleCount > 0 ? totalDistance / sampleCount : 100;
    
    // VERY lenient similarity calculation
    const rawSimilarity = Math.max(0, 100 - (avgDistance / 2) - lengthPenalty); // Divided distance by 2
    const similarity = Math.min(100, rawSimilarity);
    const isMatch = similarity > tolerance;

    return {
      similarity: Math.round(similarity),
      isMatch,
      details: {
        avgDistance: Math.round(avgDistance),
        lengthPenalty: Math.round(lengthPenalty),
        pointCount1: norm1.length,
        pointCount2: norm2.length,
        sampleCount
      }
    };
  }

  static analyzeDrawingBehavior(points, timestamps) {
    if (points.length < 2) return null;

    const speeds = this.calculateSpeed(points, timestamps);
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const totalTime = timestamps[timestamps.length - 1] - timestamps[0];
    
    // Calculate stroke count (pauses longer than 300ms indicate new stroke) - More lenient
    let strokeCount = 1;
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i-1] > 300) { // Increased from 200ms
        strokeCount++;
      }
    }

    return {
      avgSpeed: Math.round(avgSpeed * 100) / 100,
      totalTime,
      strokeCount,
      pointCount: points.length
    };
  }
}
