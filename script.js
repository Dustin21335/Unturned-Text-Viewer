const input = document.getElementById("inputText");
const output = document.getElementById("output");
const warning = document.getElementById("warning");
const tooltip = document.getElementById("tooltip");
const fontSelect = document.getElementById("fontSelect");
const alignSelect = document.getElementById("alignSelect");

function normalizeURT(text) {
  return text
    .replace(/\\n/g, "\n")

    .replace(/\[b\]/gi, "<b>")
    .replace(/\[\/b\]/gi, "</b>")

    .replace(/\[i\]/gi, "<i>")
    .replace(/\[\/i\]/gi, "</i>")

    .replace(/\[u\]/gi, "<u>")
    .replace(/\[\/u\]/gi, "</u>")

    .replace(/\[s\]/gi, "<s>")
    .replace(/\[\/s\]/gi, "</s>")

    .replace(/\[color=(.+?)\]/gi, "<color=$1>")
    .replace(/\[\/color\]/gi, "</color>")

    .replace(/\[size=(.+?)\]/gi, "<size=$1>")
    .replace(/\[\/size\]/gi, "</size>")

    .replace(/\[align=(.+?)\]/gi, "<align=$1>")
    .replace(/\[\/align\]/gi, "</align>");
}

function parseURT(text) {
  text = normalizeURT(text);

  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  text = text
    .replace(/<b>/gi, "<strong>")
    .replace(/<i>/gi, "<em>")
    .replace(/<u>/gi, "<u>")
    .replace(/<s>/gi, "<del>");

  text = text
    .replace(/<\/b>/gi, "</strong>")
    .replace(/<\/i>/gi, "</em>")
    .replace(/<\/u>/gi, "</u>")
    .replace(/<\/s>/gi, "</del>");

  text = text.replace(
    /<color=([^>]+)>/gi,
    (_, color) => `<span style="color:${color};">`
  );

  text = text.replace(/<\/color>/gi, "</span>");

  text = text.replace(
    /<size=(\d+)>/gi,
    (_, size) => `<span style="font-size:${size}px;">`
  );

  text = text.replace(/<\/size>/gi, "</span>");

  text = text.replace(
    /<align=(left|center|right)>/gi,
    (_, align) => `<div style="text-align:${align};">`
  );

  text = text.replace(/<\/align>/gi, "</div>");

  text = text.replace(
    /<link="(.+?)">([\s\S]*?)<\/link>/gi,
    "<a href='$1' target='_blank'>$2</a>"
  );

  text = text.replace(/\n/g, "<br>");

  return text;
}

function checkErrors(text) {
  let issues = [];

  text = normalizeURT(text);

  const supportedTags = [
    "b",
    "i",
    "u",
    "s",
    "color",
    "size",
    "align",
    "link"
  ];

  const tagRegex = /<\/?([a-z]+)(?:=[^>]*)?>/gi;
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    const tag = match[1].toLowerCase();

    if (!supportedTags.includes(tag)) {
      const lineIndex =
        text.substring(0, match.index).split("\n").length - 1;

      issues.push({
        msg: `Unsupported tag <${tag}>.`,
        line: lineIndex
      });
    }
  }


  return issues;
}

function highlightLine(lineIndex) {
  const lines = input.value.split("\n");

  let charIndex = 0;

  for (let i = 0; i < lineIndex; i++) {
    charIndex += lines[i].length + 1;
  }

  input.focus();

  input.setSelectionRange(
    charIndex,
    charIndex + lines[lineIndex].length
  );
}

function updateOutput() {
  const text = input.value;

  output.innerHTML = parseURT(text);

  const errors = checkErrors(text);

  tooltip.innerHTML = "";

  if (errors.length > 0) {
    warning.style.visibility = "visible";

    errors.forEach((err, idx) => {
      const item = document.createElement("div");

      item.textContent =
        `Error ${idx + 1}: ${err.msg} (line ${err.line + 1})`;

      item.onclick = () => highlightLine(err.line);

      tooltip.appendChild(item);
    });
  } else {
    warning.style.visibility = "hidden";
  }
}

input.addEventListener("input", updateOutput);

updateOutput();

const textarea = document.querySelector("textarea");

textarea.addEventListener("input", autoResize, false);

function autoResize() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

window.onload = () => autoResize.call(textarea);

const fontList = [
  { name: "Monospace", css: "monospace" },
  { name: "Arial (Default)", css: "Arial, sans-serif" },
  { name: "Verdana", css: "Verdana, sans-serif" },
  { name: "Georgia", css: "Georgia, serif" },
  { name: "Courier New", css: "'Courier New', monospace" },

  { name: "Roboto", css: "'Roboto', sans-serif" },
  { name: "Source Code Pro", css: "'Source Code Pro', monospace" },
  { name: "Lato", css: "'Lato', sans-serif" },
  { name: "Merriweather", css: "'Merriweather', serif" },
  { name: "Fira Code", css: "'Fira Code', monospace" },
  { name: "Orienta", css: "'Orienta', serif" }
];

fontList.forEach((font, idx) => {
  const option = document.createElement("option");

  option.value = font.css;
  option.textContent = font.name;

  if (idx === 0) {
    option.selected = true;
  }

  fontSelect.appendChild(option);
});

fontSelect.addEventListener("change", () => {
  output.style.fontFamily = fontSelect.value;
});

const alignList = [
  { name: "Left", css: "left" },
  { name: "Center", css: "center" },
  { name: "Right", css: "right" }
];

alignList.forEach((align, idx) => {
  const option = document.createElement("option");

  option.value = align.css;
  option.textContent = align.name;

  if (idx === 0) option.selected = true;

  alignSelect.appendChild(option);
});


  output.style.textAlign = alignSelect.value;
});