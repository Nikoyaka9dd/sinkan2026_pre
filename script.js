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

renderQAItems();
observeRevealTargets();
window.addEventListener("resize", syncOpenQAHeights);
