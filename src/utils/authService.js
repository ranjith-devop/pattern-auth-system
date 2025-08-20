export class AuthService {
  static STORAGE_KEY = 'pattern_auth_users';

  static getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  static saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  static register(username, email, patternData, emojiData) {
    const users = this.getUsers();
    
    if (users.find(u => u.username === username || u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      pattern: patternData,
      emojis: emojiData,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static async login(username, patternData, emojiData) {
    const users = this.getUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Import PatternUtils dynamically
    const { PatternUtils } = await import('./patternUtils.js');
    const comparison = PatternUtils.comparePatterns(user.pattern, patternData, 60); // Lower threshold
    
    if (!comparison.isMatch) {
      throw new Error(`Pattern doesn't match. Similarity: ${comparison.similarity}%`);
    }

    // Check emoji secondary authentication
    if (!this.compareEmojis(user.emojis, emojiData)) {
      throw new Error('Emoji authentication failed');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);
    
    // Store current user session
    localStorage.setItem('current_user', JSON.stringify(user));
    
    return { user, comparison };
  }

  static compareEmojis(stored, provided) {
    if (!stored || !provided) return false;
    if (stored.length !== provided.length) return false;
    
    return stored.every((emoji, index) => emoji === provided[index]);
  }

  static getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('current_user'));
    } catch {
      return null;
    }
  }

  static logout() {
    localStorage.removeItem('current_user');
  }
}
