const qaData = [
  {
    question: "京大生と他大学生の割合はどれくらいですか？",
    answer: "京大生とそれ以外の学生で半々程度です。他大生では、同志社大学、立命館大学、京都産業大学、京都女子大学、京都工業繊維大学などの学生が在籍しています。"
  },
  {
    question: "男女比はどれくらいですか？",
    answer: "およそ1:1です。"
  },
  {
    question: "役者以外のスタッフや脚本のみでも大丈夫ですか？",
    answer: "もちろん大歓迎です！現団員にも特定のスタッフワークを極めた人や、役者以外の全部署マイスターになった人がいます。"
  },
  {
    question: "他サークルと兼ねたり、バイトとの勉強の両立はできますか？",
    answer: "可能です!現団員にも他団体と兼サーしている人がいます。また劇団ケッペキでは年10回前後公演を行っていますが、毎公演ごとに参加する・しない、がっつり参加する・ほかの予定があるので可能な限りで参加する  などをお選びいただけるので、自分のライフスタイルに合わせて柔軟にサークル活動に参加することができます。"
  },
  {
    question: "主な活動場所はどこですか？",
    answer: "​京都大学の施設をはじめ、京都市の青少年活動センターなど様々な場所で活動しています。公演も京都大学の施設や外部の会場を借りて行うことが多いです。"
  },
  {
    question: "演劇未経験でも大丈夫ですか？",
    answer: "もちろんです！現団員も役者・スタッフ問わずほとんどが演劇未経験でケッペキに入団していますが、バリバリに活躍しています！"
  },
  {
    question: "大学1回生ではないのですが入団できますか？",
    answer: "もちろん可能です!2回生以上で入団する人も多くいます。"
  }

];

const qaList = document.getElementById("qa-list");
const qaTemplate = document.getElementById("qa-item-template");

function createQAItem(item, index) {
  const qaNode = qaTemplate.content.firstElementChild.cloneNode(true);
  const button = qaNode.querySelector(".qa-question");
  const questionText = qaNode.querySelector(".qa-question-text");
  const icon = qaNode.querySelector(".qa-icon");
  const answerPanel = qaNode.querySelector(".qa-answer");
  const answerText = qaNode.querySelector(".qa-answer-text");

  const answerId = `qa-answer-${index + 1}`;
  questionText.textContent = item.question;
  answerText.textContent = item.answer;
  answerPanel.id = answerId;
  button.setAttribute("aria-controls", answerId);

  button.addEventListener("click", () => {
    const isOpen = qaNode.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    icon.textContent = isOpen ? "−" : "+";
    answerPanel.style.maxHeight = isOpen ? `${answerPanel.scrollHeight}px` : "0px";
  });

  return qaNode;
}

function renderQAItems() {
  qaData.forEach((item, index) => {
    qaList.append(createQAItem(item, index));
  });
}

function observeRevealTargets() {
  const revealTargets = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px"
    }
  );

  revealTargets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index * 70, 360)}ms`;
    observer.observe(target);
  });
}

function syncOpenQAHeights() {
  document.querySelectorAll(".qa-item.is-open .qa-answer").forEach((panel) => {
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  });
}

function isKanjiWord(text) {
  return /^[\p{Script=Han}々〆ヵヶ]+$/u.test(text);
}

function isWordLikeToken(text) {
  return /[A-Za-z0-9\u3040-\u30ff\u3400-\u9fff々〆ヵヶ]/u.test(text);
}

function mergeWordSegments(segments) {
  const merged = [];

  segments.forEach((segment) => {
    const token = segment.segment;
    if (!token) {
      return;
    }

    const isWordLike = Boolean(segment.isWordLike);
    const prev = merged[merged.length - 1];

    const canMergeKanji =
      isWordLike &&
      prev &&
      prev.isWordLike &&
      isKanjiWord(prev.text) &&
      isKanjiWord(token) &&
      prev.text.length + token.length <= 8;

    if (canMergeKanji) {
      prev.text += token;
      return;
    }

    merged.push({ text: token, isWordLike });
  });

  return merged;
}

function tokenizeFallback(text) {
  const pattern =
    /(\s+|[、。！？・「」（）『』【】［］〈〉《》…,.!?;:]+|[A-Za-z0-9][A-Za-z0-9+._:/-]*|[ぁ-んァ-ヴー]+|[\p{Script=Han}々〆ヵヶ]+|.)/gu;
  const tokens = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const token = match[0];
    tokens.push({
      text: token,
      isWordLike: isWordLikeToken(token)
    });
  }

  return tokens;
}

function tokenizeForWordLock(text, segmenter) {
  if (segmenter) {
    return mergeWordSegments(Array.from(segmenter.segment(text)));
  }

  return tokenizeFallback(text);
}

function applyWordLockToElement(element, segmenter) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent || parent.closest(".word-lock, .no-break, .qa-icon")) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    const tokens = tokenizeForWordLock(node.nodeValue, segmenter);
    if (!tokens.some((token) => token.isWordLike)) {
      return;
    }

    const fragment = document.createDocumentFragment();
    tokens.forEach((token) => {
      if (!token.isWordLike) {
        fragment.append(document.createTextNode(token.text));
        return;
      }

      const span = document.createElement("span");
      span.className = "word-lock";
      span.textContent = token.text;
      fragment.append(span);
    });

    node.replaceWith(fragment);
  });
}

function lockWordBreaks() {
  const segmenter =
    typeof Intl !== "undefined" && Intl.Segmenter
      ? new Intl.Segmenter("ja", { granularity: "word" })
      : null;

  const targets = document.querySelectorAll(
    ".hero-title, .section-title, .section-link, .sns-button, .intro-text h3, .intro-text p, .qa-question-text, .qa-answer-text"
  );

  targets.forEach((element) => {
    applyWordLockToElement(element, segmenter);
  });
}

renderQAItems();
observeRevealTargets();
lockWordBreaks();
window.addEventListener("resize", syncOpenQAHeights);
