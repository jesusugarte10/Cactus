# Jesus Ugarte - Portfolio Website

A modern, single-page portfolio website with parallax scrolling effects showcasing projects, experience, and achievements.

## Project Structure

```
Cactus/
├── index.html              # Main HTML file (single-page application)
├── css/
│   └── style.css           # All styles and responsive design
├── assets/
│   ├── images/             # Image files
│   │   └── grad.PNG        # Graduation photo
│   ├── videos/             # Video files
│   │   ├── MR.mp4          # Mixed Reality video (hero section)
│   │   ├── LAUNCH.mp4      # Rocket launch video (story section)
│   │   └── dancing.mp4      # Fun video (end section)
│   ├── icons/              # Icon files
│   │   ├── menu.png        # Menu icon
│   │   ├── close.png       # Close icon
│   │   ├── github_PNG58.png
│   │   ├── kaggle-logo-transparent-300.png
│   │   └── linkedIn_PNG38.png
│   └── documents/          # Document files
│       └── RESUME.pdf      # Resume document
└── archive/                # Old/unused files
    ├── contact.html
    ├── my_story.html
    ├── graduation.html
    └── story.txt
```

## Features

- **Single-Page Design**: All content accessible through smooth scrolling
- **Parallax Scrolling**: Beautiful parallax effects on background videos and images
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **9 Featured Projects**: Showcasing various technologies and applications
- **Animated Text**: TypeIt.js animations for engaging user experience
- **Cross-Browser Compatible**: Works on all modern browsers

## Sections

1. **Home/Hero**: Introduction with animated text and background video
2. **My Story**: Personal journey with rocket launch video
3. **Projects**: 9 featured projects with links
4. **Graduation**: Achievement showcase with graduation photo
5. **Contact**: Contact information and links
6. **Fun Video**: Lighthearted ending with dancing video

## Running Locally

### Method 1: Python HTTP Server
```bash
cd /Users/JesusUgarte/Desktop/Cactus
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

### Method 2: Node.js HTTP Server
```bash
cd /Users/JesusUgarte/Desktop/Cactus
npx http-server -p 8000
```

### Method 3: VS Code Live Server
Install the "Live Server" extension and right-click on `index.html` → "Open with Live Server"

## Technologies Used

- HTML5
- CSS3 (with modern features like CSS Grid, Flexbox, and animations)
- JavaScript (Vanilla JS)
- TypeIt.js (for text animations)
- Parallax scrolling effects

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- All old HTML files (contact.html, my_story.html, graduation.html) have been moved to the `archive/` folder as they are no longer needed (everything is now on one page)
- The website uses a single-page architecture for better performance and user experience
- All assets are organized in logical folders for easy maintenance

