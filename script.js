// Dynamic Document Title
const originalTitle = document.title;
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = "Come back to me...";
    } else {
        document.title = originalTitle;
    }
});

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
const secretMessageSection = document.getElementById('secret-message');
const timeCounter = document.getElementById('time-counter');
const secretStar = document.getElementById('secret-star');

const verseTextNode = document.getElementById('verse-text');
const verseRefNode = document.getElementById('verse-ref');

let currentVerseIndex = 0;
let versesInterval;

// Custom Cursor & Dynamic Background Trail
const cursor = document.getElementById('custom-cursor');
const trail = document.getElementById('cursor-trail');
const ambientBg = document.querySelector('.ambient-background');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';

    // Particle Ripple / Dynamic Background Tracking
    // We gently shift the background position based on mouse coordinates to create a ripple/following effect
    const xPercent = (e.clientX / window.innerWidth) * 100;
    const yPercent = (e.clientY / window.innerHeight) * 100;
    // Overlaying the animation with a dynamic radial gradient exactly where the mouse is.
    ambientBg.style.background = `
        radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255, 105, 135, 0.25), transparent 40%),
        radial-gradient(circle at 15% 50%, var(--blob-1), transparent 50%),
        radial-gradient(circle at 85% 30%, var(--blob-2), transparent 50%)
    `;
});

document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
});

document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
});

// Time Counter Logic (03/08/2025 at 07:13)
const startDate = new Date('2025-03-08T07:13:00').getTime();
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateCounter() {
    const now = new Date().getTime();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
}
setInterval(updateCounter, 1000);
updateCounter();

let audioContext;
let analyser;
let source;

startBtn.addEventListener('click', () => {
    // Check if we are running on a local file system. 
    // Browsers block Web Audio API (visualizers) from file:// for security reasons, muting the audio entirely.
    const isLocalFile = window.location.protocol === 'file:';

    // Initialize Audio Visualizer Context on first interaction (only if not a local file)
    if (!audioContext && !isLocalFile) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256;

            // Start Visualizer function (defined below)
            drawVisualizer();
        } catch (e) {
            console.warn("Audio Context failed to initialize.", e);
        }
    } else if (isLocalFile) {
        console.warn("Running locally via file://. The visualizer is disabled to prevent the browser from muting the music.");
        // We can fake the visualizer or just let it be blank so the song actually plays!
    }

    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // Attempt to play music
    let playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Audio file missing or blocked.", error);
            alert("Music Playback Failed!\n\nReason: " + error.message);
        });
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

    // 2. Wait a moment, then fade in the letter container and begin typing
    setTimeout(() => {
        letterSection.classList.add('active');
        startTypingEffect();
    }, 1000);

    // 3. Keep letter on screen for a while. We extend the time slightly because typing takes time.
    // Typing length is roughly: Greeting (38 chars) + Body (260 chars) + Sig (16 chars) = ~314 chars.
    // At ~35ms per char, it takes about 11 seconds just to type. We'll wait 22 seconds total.
    setTimeout(() => {
        letterSection.classList.remove('active');
        letterSection.classList.add('fade-out');

        // 4. Start the verses cycle
        setTimeout(() => {
            startVerses();

            // Show lower elements
            timeCounter.classList.add('active');
            secretStar.classList.add('active');
        }, 1500);

    }, 24000);
}

// Typing Effect Mechanics
const letterText = {
    greeting: "To the most beautiful girl in the world,",
    body: "Every moment with you feels like a dream I never want to wake up from. You are my light, my peace, and my entire heart. I wanted to make this just to remind you how deeply, truly, and completely I love you. I am yours forever through every lifetime, every moment, and every heartbeat. My world is infinitely better simply because you are in it.",
    signature: "- Forever yours."
};

function typeString(element, string, speed, callback) {
    element.classList.add('typing');
    let i = 0;
    function typeChar() {
        if (i < string.length) {
            element.textContent += string.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        } else {
            element.classList.remove('typing');
            if (callback) callback();
        }
    }
    typeChar();
}

function startTypingEffect() {
    const greetingEl = document.getElementById('typed-greeting');
    const bodyEl = document.getElementById('typed-body');
    const signatureEl = document.getElementById('typed-signature');

    // Type Greeting -> short pause -> Type Body -> short pause -> Type Signature
    typeString(greetingEl, letterText.greeting, 40, () => {
        setTimeout(() => {
            typeString(bodyEl, letterText.body, 30, () => {
                setTimeout(() => {
                    typeString(signatureEl, letterText.signature, 50);
                }, 1000);
            });
        }, 800);
    });
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

    // Heart pop logic
    heart.addEventListener('click', () => {
        heart.style.animationPlayState = 'paused';
        heart.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        heart.style.transform += ' scale(2.5)';
        heart.style.opacity = '0';
        setTimeout(() => { if (heart.parentNode) heart.remove(); }, 300);
    });

    document.body.appendChild(heart);

    // Clean up DOM after animation finishes
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, 19000);
}

function startHearts() {
    // Initial burst
    for (let i = 0; i < 12; i++) {
        setTimeout(createHeart, i * 300);
    }
    // Continuous gently floating hearts
    setInterval(createHeart, 800);
}

// Secret Promise Logic
secretStar.addEventListener('click', () => {
    // Hide verses, show secret
    versesSection.classList.remove('active');
    versesSection.classList.add('fade-out');

    // Stop the verse loop visually
    clearInterval(versesInterval);

    setTimeout(() => {
        secretMessageSection.classList.add('active');
        secretStar.style.opacity = '0'; // Hide the star gracefully
        setTimeout(() => secretStar.style.display = 'none', 1000);
    }, 1500);
});

// Audio Visualizer Drawing Logic
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);

    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // We draw glowing bars at the bottom of the screen
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.5; // Scale up the height slightly

        // Glowing pink/white gradient
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(255, 138, 166, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        ctx.fillStyle = gradient;

        // Draw bars rounding from the bottom
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2; // Spacing between bars
    }
}
