# Three in a Row - Match Game 🎮

An engaging three-in-a-row match game with smooth animations, multiple difficulty levels, and mobile support!

## 🎯 Features

- **Two Game Modes:**
  - **Move Limited**: Reach the target score within limited moves
  - **Endless Mode**: Play infinitely and achieve the highest score

- **Three Difficulty Levels:**
  - Easy: 3 colors, 40 moves, target 500
  - Medium: 4 colors, 30 moves, target 600
  - Hard: 5 colors, 25 moves, target 750

- **Gameplay Features:**
  - 8x8 grid with colorful circles
  - Swap-based matching mechanics
  - Combo multiplier system for consecutive matches
  - Special power-ups for 4+ matches
  - Auto-hint system after 6 seconds of inactivity
  - High score tracking (saved locally)

- **Special Power-ups:**
  - Row Blast (→): Clears entire row
  - Column Blast (↓): Clears entire column
  - Mega Blast (💥): Clears surrounding area

- **Visual Effects:**
  - Smooth animations for swapping and matching
  - Particle effects when circles disappear
  - Responsive design for mobile and desktop
  - Touch-friendly controls

## 🚀 Deployment to GitHub Pages

### Quick Deploy

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add three in a row game"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Your game will be available at: `https://yourusername.github.io/repository-name/`

### Local Testing

Simply open `index.html` in a web browser:
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server

# Or just open the file
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

Then navigate to `http://localhost:8000`

## 🎮 How to Play

1. **Start the Game**: Click "Start Game" from the menu
2. **Choose Mode**: Select between Move Limited or Endless mode
3. **Select Difficulty**: Pick Easy, Medium, or Hard
4. **Match Circles**: Click a circle, then click an adjacent circle to swap
5. **Create Matches**: Match 3 or more circles of the same color in a row
6. **Score Points**: Earn points and build combos with consecutive matches
7. **Win**: Reach the target score (Move Limited) or beat your high score (Endless)

## 📱 Mobile Support

The game is fully optimized for mobile devices with:
- Touch-friendly controls
- Responsive grid that adapts to screen size
- Optimized animations for performance
- Pull-to-refresh disabled during gameplay

## 🛠️ Technical Details

- **Pure HTML5/CSS3/JavaScript** - No dependencies or frameworks required
- **CSS Grid** - For responsive game board layout
- **CSS Animations** - Smooth, hardware-accelerated animations
- **LocalStorage** - For persistent high score tracking
- **Touch Events** - Native mobile support

## 📂 Project Structure

```
three-in-a-row-web/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── game.js         # Game logic and mechanics
└── README.md       # Documentation
```

## 🎨 Customization

You can easily customize the game by modifying:

- **Colors**: Edit the `.circle.color-X` classes in `styles.css`
- **Grid Size**: Change `GRID_SIZE` constant in `game.js`
- **Scoring**: Modify `SCORES` object in `game.js`
- **Difficulty**: Update `config` object in `game.js`
- **Hint Delay**: Change `HINT_DELAY` constant in `game.js`

## 🏆 Scoring System

- **3 Match**: 10 points × combo multiplier
- **4 Match**: 25 points × combo multiplier + power-up
- **5+ Match**: 50 points × combo multiplier + mega power-up
- **Combo Multiplier**: Increases by 1x for each consecutive match (resets when no matches)

## 🐛 Browser Support

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Fully supported

## 📝 License

Feel free to use, modify, and distribute this game!

## 🎉 Enjoy!

Have fun playing Three in a Row! Try to beat your high scores across all difficulties and modes!
