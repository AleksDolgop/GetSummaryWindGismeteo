// ==UserScript==
// @name         Get summary wind
// @namespace    http://tampermonkey.net/
// @version      2.1
// @downloadURL https://raw.githubusercontent.com/AleksDolgop/GetSummaryWindGismeteo/main/script.js
// @updateURL https://raw.githubusercontent.com/AleksDolgop/GetSummaryWindGismeteo/main/script.js
// @description  Собирает сумму ветров от направлений
// @author       AleksDolgop
// @match        https://www.gismeteo.ru/diary/*/*/*/
// @match        https://www.gismeteo.ru/diary/*/*/
// @match        https://www.gismeteo.ru/diary/*/
// @grant        none
// @require https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.min.js
// ==/UserScript==

let lastReadedData = null;
let preData = null;

let windRoseData = {
  winter: [50, 50, 50, 50, 50, 50, 50, 50],
  summer: [0, 0, 0, 0, 0, 0, 0, 0],
};

if (window.localStorage.windRoseData) {
  windRoseData = JSON.parse(window.localStorage.windRoseData);
}

function allSum(...args) {
  let sum = 0;
  for (const arg of args) {
    sum += arg;
  }
  return sum;
}

function repaintWindRose() {
  const oldRose = document.getElementById('tempRoseDataBlock');
  if (oldRose) {
    document.body.removeChild(oldRose);
  }
  const roseDiv = document.createElement('div');
  roseDiv.id = 'tempRoseDataBlock';
  roseDiv.style.position = 'fixed';
  roseDiv.style.bottom = 0;
  roseDiv.style.right = 0;
  roseDiv.style.padding = '15px';
  roseDiv.style.backgroundColor = '#fff';
  roseDiv.style.border = '1px solid black';
  roseDiv.style.width = roseDiv.style.height = '300px';
  roseDiv.style.zIndex = 1000;
  roseDiv.style.marginBottom = '10px';
  roseDiv.style.marginRight = '10px';

  const sizeButton = document.createElement('input');
  sizeButton.value = 'resize';
  sizeButton.type = 'button';
  sizeButton.style.position = 'absolute';
  sizeButton.style.top = '-25px';
  sizeButton.style.left = 0;
  sizeButton.style.height = '20px';
  sizeButton.style.fontSize = '12px';
  sizeButton.style.lineHeight = '8px';
  sizeButton.onclick = () => {
    if (roseDiv.style.width === '300px') {
      roseDiv.style.width = roseDiv.style.height = '700px';
    } else {
      roseDiv.style.width = roseDiv.style.height = '300px';
    }
  };
  roseDiv.appendChild(sizeButton);

  const resetButton = document.createElement('input');
  resetButton.value = 'reset';
  resetButton.type = 'button';
  resetButton.style.position = 'absolute';
  resetButton.style.top = '-25px';
  resetButton.style.right = 0;
  resetButton.style.height = '20px';
  resetButton.style.fontSize = '12px';
  resetButton.style.lineHeight = '8px';
  resetButton.onclick = () => {
    windRoseData = {
      winter: [50, 50, 50, 50, 50, 50, 50, 50],
      summer: [0, 0, 0, 0, 0, 0, 0, 0],
    };
    delete window.localStorage.windRoseData;
    repaintWindRose();
  };
  roseDiv.appendChild(resetButton);

  const saveWinterButton = document.createElement('input');
  saveWinterButton.value = 'save winter';
  saveWinterButton.type = 'button';
  saveWinterButton.style.position = 'absolute';
  saveWinterButton.style.top = '-25px';
  saveWinterButton.style.right = '45px';
  saveWinterButton.style.height = '20px';
  saveWinterButton.style.fontSize = '12px';
  saveWinterButton.style.lineHeight = '8px';
  saveWinterButton.onclick = () => {
    const sumData = sumAll();
    windRoseData.winter = Object.keys(sumData).map(key => sumData[key]);
    window.localStorage.windRoseData = JSON.stringify(windRoseData);
    repaintWindRose();
  };
  roseDiv.appendChild(saveWinterButton);

  const saveSummerButton = document.createElement('input');
  saveSummerButton.value = 'save summer';
  saveSummerButton.type = 'button';
  saveSummerButton.style.position = 'absolute';
  saveSummerButton.style.top = '-25px';
  saveSummerButton.style.right = '123px';
  saveSummerButton.style.height = '20px';
  saveSummerButton.style.fontSize = '12px';
  saveSummerButton.style.lineHeight = '8px';
  saveSummerButton.onclick = () => {
    const sumData = sumAll();
    windRoseData.summer = Object.keys(sumData).map(key => sumData[key]);
    window.localStorage.windRoseData = JSON.stringify(windRoseData);
    repaintWindRose();
  };
  roseDiv.appendChild(saveSummerButton);

  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'tempWindRoseGraph';
  newCanvas.style.width = '200px';
  newCanvas.style.height = '200px';

  let massData = Object.keys(lastReadedData).map(key => lastReadedData[key]);
  const sum = allSum(...massData);
  massData = massData.map(item => Math.round((item * 100) / sum));
  console.log(massData);
  var myRadarChart = new window.Chart(newCanvas, {
    type: 'radar',
    data: {
      labels: Object.keys(lastReadedData),
      datasets: [
        {
          label: '',
          data: windRoseData.summer,
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)',
        },
        {
          label: '',
          data: windRoseData.winter,
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(54, 162, 235)',
        },
      ],
    },
    options: {
      responsiveAnimationDuration: 2000,
      maintainAspectRatio: false,
      pointDot: false,
      pointLabelFontSize: 0,
      tooltip: {
        enabled: false,
      },
      legend: {
        position: 'bottom',
        display: false,
      },
      pointLabel: {
        fontSize: 0,
      },
      scale: {
        ticks: {
          display: false,
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    },
  });

  roseDiv.appendChild(newCanvas);
  document.body.appendChild(roseDiv);
}

function copyToClipboard(str) {
  var area = document.createElement('textarea');

  document.body.appendChild(area);
  area.value = str;
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
}

function resetStorage() {
  delete window.localStorage.tempBlockData;
  printPreData();
}

function printPreData() {
  preData.textContent = 'This:\n';
  preData.textContent += Object.keys(lastReadedData)
    .map(key => `${key}: ${lastReadedData[key]}`)
    .join('\n');
}

function sumAll() {
  let printData = lastReadedData;
  if (
    typeof window.localStorage.tempBlockData === 'string' &&
    window.localStorage.tempBlockData.length
  ) {
    printData = JSON.parse(window.localStorage.tempBlockData);
  }
  return printData;
}

function printSumAll() {
  const printData = sumAll();
  preData.textContent = 'All Sum:\n';
  preData.textContent += Object.keys(printData)
    .map(key => `${key}: ${printData[key]}`)
    .join('\n');
}

function addStorage() {
  let ls = lastReadedData;
  if (
    typeof window.localStorage.tempBlockData === 'string' &&
    window.localStorage.tempBlockData.length
  ) {
    ls = JSON.parse(window.localStorage.tempBlockData);
    for (const key in ls) {
      ls[key] += lastReadedData[key];
    }
  }
  window.localStorage.tempBlockData = JSON.stringify(ls);
  printPreData();
}

(function () {
  'use strict';
  const dArr = ['С', 'СВ', 'СЗ', 'В', 'З', 'ЮЗ', 'ЮВ', 'Ю'];
  const data = {
    С: 0,
    СВ: 0,
    В: 0,
    ЮВ: 0,
    Ю: 0,
    ЮЗ: 0,
    З: 0,
    СЗ: 0,
  };
  const data_block = document.getElementById('data_block');

  if (data_block) {
    const table = data_block.children[2].children[1];
    for (const elem of table.children) {
      const ttt = elem.children[5].textContent.slice(0, 2).trim();
      if (dArr.includes(ttt)) {
        data[ttt]++;
      }
    }
  }

  lastReadedData = data;

  const newDiv = document.createElement('div');
  let newPre = document.createElement('pre');
  newPre.style.textAlign = 'left';
  preData = newPre;
  newDiv.appendChild(newPre);

  newDiv.id = 'tampDataBlock';
  newDiv.style.position = 'fixed';
  newDiv.style.textAlign = 'center';
  newDiv.style.bottom = 0;
  newDiv.style.left = 0;
  newDiv.style.backgroundColor = '#fff';
  newDiv.style.border = '1px solid black';
  newDiv.style.height = '215px';
  newDiv.style.width = '80px';
  newDiv.style.zIndex = 1000;
  newDiv.style.paddingLeft = '10px';
  newDiv.style.marginBottom = '10px';
  newDiv.style.marginLeft = '10px';

  let newA = document.createElement('a');
  newA.textContent = 'copy';
  newA.href = '#';
  newA.style.textDecoration = 'none';
  newA.style.width = '50px';
  newA.style.float = 'left';
  newA.onclick = () => {
    copyToClipboard(newPre.textContent);
  };
  newDiv.appendChild(newA);

  newA = document.createElement('a');
  newA.textContent = 'add';
  newA.href = '#';
  newA.style.textDecoration = 'none';
  newA.style.float = 'left';
  newA.style.marginTop = '2px';
  newA.style.width = '50px';
  newA.onclick = addStorage;
  newDiv.appendChild(newA);

  newA = document.createElement('a');
  newA.textContent = 'reset';
  newA.href = '#';
  newA.style.textDecoration = 'none';
  newA.style.width = '50px';
  newA.style.float = 'left';
  newA.style.marginTop = '2px';
  newA.onclick = resetStorage;
  newDiv.appendChild(newA);

  newA = document.createElement('a');
  newA.textContent = 'sumAll';
  newA.href = '#';
  newA.style.textDecoration = 'none';
  newA.style.width = '50px';
  newA.style.marginTop = '2px';
  newA.style.float = 'left';
  newA.onclick = printSumAll;
  newDiv.appendChild(newA);

  printPreData();
  document.body.appendChild(newDiv);

  repaintWindRose();
})();
