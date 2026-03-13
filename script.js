const quotes = [
    { text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", ref: "1 Corinthians 13:4" },
    { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
    { text: "Above all, love each other deeply, because love covers over a multitude of sins.", ref: "1 Peter 4:8" },
    { text: "I have found the one whom my soul loves.", ref: "Song of Solomon 3:4" },
    { text: "Many waters cannot quench love; rivers cannot sweep it away.", ref: "Song of Solomon 8:7" },
    { text: "Be completely humble and gentle; be patient, bearing with one another in love.", ref: "Ephesians 4:2" }
];

const startBtn = document.getElementById('start-btn');
const audio = document.getElementById('love-song');

const introSection = document.getElementById('intro-section');
const letterSection = document.getElementById('letter-section');
const versesSection = document.getElementById('verses-section');

const verseTextNode = document.getElementById('verse-text');
const verseRefNode = document.getElementById('verse-ref');

let currentVerseIndex = 0;
let versesInterval;

startBtn.addEventListener('click', () => {
    // Attempt to play music
    let playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => console.warn("Audio file 'song.mp3' missing or blocked.", error));
    }

    // Start Sequence
    runSequence();
    
    // Start Hearts
    startHearts();
});

function runSequence() {
    // 1. Fade out intro button
    introSection.classList.remove('active');
    introSection.classList.add('fade-out');

    // 2. Wait a moment, then fade in the letter
    setTimeout(() => {
        letterSection.classList.add('active');
    }, 1000);

    // 3. Keep letter on screen for a while to read, then fade it out
    // Adjust time below (currently 12 seconds = 12000ms)
    setTimeout(() => {
        letterSection.classList.remove('active');
        letterSection.classList.add('fade-out');
        
        // 4. Start the verses cycle
        setTimeout(() => {
            startVerses();
        }, 1500);

    }, 12000);
}

function startVerses() {
    displayVerse();
    versesSection.classList.add('active');

    versesInterval = setInterval(() => {
        // Fade out current verse
        versesSection.classList.remove('active');
        versesSection.classList.add('fade-out');

        setTimeout(() => {
            // Change text
            currentVerseIndex = (currentVerseIndex + 1) % quotes.length;
            displayVerse();

            // Fade back in
            versesSection.classList.remove('fade-out');
            versesSection.classList.add('active');
        }, 1500); // Time it takes to fade out

    }, 7000); // How long each verse stays on screen
}

function displayVerse() {
    verseTextNode.textContent = `"${quotes[currentVerseIndex].text}"`;
    verseRefNode.textContent = `- ${quotes[currentVerseIndex].ref}`;
}

// Heart Particle System
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    
    // Randomize horizontal start position
    heart.style.left = Math.random() * 100 + 'vw';
    
    // Randomize speed/duration of the float (10s to 18s)
    heart.style.animationDuration = (Math.random() * 8 + 10) + 's';
    
    // Slight sway effect randomly assigned via animation-delay
    heart.style.animationDelay = (Math.random() * 2) + 's';
    
    document.body.appendChild(heart);
    
    // Clean up DOM after animation finishes
    setTimeout(() => {
        if(heart.parentNode) {
            heart.remove();
        }
    }, 19000);
}

function startHearts() {
    // Initial burst
    for(let i=0; i<12; i++) {
        setTimeout(createHeart, i * 300);
    }
    // Continuous gently floating hearts
    setInterval(createHeart, 800);
}
