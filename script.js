// Hero demo: a fake player that pauses and shows the Huh? card on Alt+H.

const SAMPLES = [
  {
    label: 'Hindi lecture',
    title: 'Money basics, lecture 4 (Hindi)',
    from: 'Hindi', to: 'English', heardLang: 'hi', saidLang: 'en',
    heard: 'अगर आपने compound interest समझ लिया, तो आधा finance समझ गए।',
    said: "If you've understood compound interest, you've understood half of finance.",
    explain: 'The speaker is saying compound interest is the core idea behind most money decisions. Once it clicks, a lot of finance gets easier to follow.',
    terms: [['Compound interest', 'Interest earned on your original money and on the interest it has already made.']],
  },
  {
    label: 'Tamil film',
    title: 'Classic Tamil film scene',
    from: 'Tamil', to: 'English', heardLang: 'ta', saidLang: 'en',
    heard: 'நான் ஒரு தடவ சொன்னா, நூறு தடவ சொன்ன மாதிரி.',
    said: 'If I say it once, it’s as good as saying it a hundred times.',
    explain: 'A famous punch line. The hero means his word is final: he won’t repeat himself, and he will do what he says.',
    terms: [['Punch line', 'A short, dramatic line a hero says, often quoted by fans.']],
  },
  {
    label: 'English podcast',
    title: 'Startup podcast, episode 31',
    from: 'English', to: 'Hindi', heardLang: 'en', saidLang: 'hi',
    heard: 'We basically shipped it behind a feature flag and dogfooded it for a week.',
    said: 'हमने इसे feature flag के पीछे रिलीज़ किया और एक हफ़्ते तक खुद इस्तेमाल करके परखा।',
    explain: 'वक्ता कह रहे हैं कि नया फ़ीचर सबके लिए चालू करने से पहले, उन्होंने उसे छुपाकर रखा और एक हफ़्ते तक अपनी ही टीम से आज़माया।',
    terms: [
      ['Feature flag', 'एक स्विच, जिससे कोई फ़ीचर कुछ ही लोगों के लिए चालू किया जाता है।'],
      ['Dogfooding', 'अपना ही प्रोडक्ट खुद इस्तेमाल करके परखना।'],
    ],
  },
];

const LANGUAGES = [
  ['English', 'English'], ['हिन्दी', 'Hindi'], ['বাংলা', 'Bengali'], ['தமிழ்', 'Tamil'], ['తెలుగు', 'Telugu'],
  ['ಕನ್ನಡ', 'Kannada'], ['മലയാളം', 'Malayalam'], ['मराठी', 'Marathi'], ['ગુજરાતી', 'Gujarati'], ['ਪੰਜਾਬੀ', 'Punjabi'],
  ['ଓଡ଼ିଆ', 'Odia'], ['অসমীয়া', 'Assamese'], ['اردو', 'Urdu'], ['नेपाली', 'Nepali'], ['कोंकणी', 'Konkani'],
  ['کٲشُر', 'Kashmiri'], ['سنڌي', 'Sindhi'], ['संस्कृतम्', 'Sanskrit'], ['ᱥᱟᱱᱛᱟᱲᱤ', 'Santali'], ['ꯃꯤꯇꯩꯂꯣꯟ', 'Manipuri'],
  ['बड़ो', 'Bodo'], ['मैथिली', 'Maithili'], ['डोगरी', 'Dogri'],
];

const $ = (id) => document.getElementById(id);
const player = document.querySelector('.player');
const card = $('card');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let current = 0;
let seconds = 252;
let fillTimer = null;

// wave bars with varied heights so it reads as speech
const wave = document.querySelector('.wave');
for (let i = 0; i < 28; i++) {
  const bar = document.createElement('i');
  bar.style.setProperty('--h', (0.35 + Math.abs(Math.sin(i * 1.7)) * 0.65).toFixed(2));
  bar.style.animationDelay = `${(i * 73) % 900}ms`;
  wave.append(bar);
}

// sample chips
const samplesEl = $('samples');
SAMPLES.forEach((s, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.role = 'radio';
  b.textContent = s.label;
  b.addEventListener('click', () => pick(i));
  samplesEl.append(b);
});

// language wall
$('langWall').append(...LANGUAGES.map(([native, english]) => {
  const li = document.createElement('li');
  li.textContent = native;
  if (native !== english) {
    const span = document.createElement('span');
    span.textContent = english;
    li.append(span);
  }
  return li;
}));

function pick(i) {
  current = i;
  [...samplesEl.children].forEach((b, j) => b.setAttribute('aria-checked', String(j === i)));
  $('clipTitle').textContent = SAMPLES[i].title;
  closeCard();
}

function setPlaying(playing) {
  player.dataset.state = playing ? 'playing' : 'paused';
  $('pp').setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
}

function openCard() {
  const s = SAMPLES[current];
  setPlaying(false);
  card.classList.remove('filled');
  $('langs').textContent = `${s.from} to ${s.to}`;
  $('status').textContent = 'Getting the last 12 seconds…';
  $('heard').textContent = `“${s.heard}”`;
  $('heard').lang = s.heardLang;
  $('said').textContent = s.said;
  $('said').parentElement.lang = s.saidLang;
  $('explain').textContent = s.explain;
  $('explain').lang = s.saidLang;
  $('terms').replaceChildren(...s.terms.map(([term, meaning]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = meaning;
    row.append(dt, dd);
    return row;
  }));
  card.hidden = false;
  card.focus({ preventScroll: true });

  clearTimeout(fillTimer);
  fillTimer = setTimeout(() => {
    $('status').textContent = '';
    card.classList.add('filled');
  }, reduceMotion ? 0 : 700);
}

function closeCard() {
  clearTimeout(fillTimer);
  card.hidden = true;
  card.classList.remove('filled');
  setPlaying(true);
}

const toggle = () => (card.hidden ? openCard() : closeCard());

document.addEventListener('keydown', (e) => {
  if (e.altKey && e.code === 'KeyH') {
    e.preventDefault();
    toggle();
  } else if (e.key === 'Escape' && !card.hidden) {
    closeCard();
  }
});
$('try').addEventListener('click', toggle);
$('close').addEventListener('click', closeCard);
$('pp').addEventListener('click', () => {
  if (!card.hidden) closeCard();
  else setPlaying(player.dataset.state !== 'playing');
});

// clock ticks while "playing"
setInterval(() => {
  if (player.dataset.state !== 'playing') return;
  seconds++;
  $('time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  $('progress').style.width = `${(seconds % 660) / 6.6}%`;
}, 1000);

pick(0);
