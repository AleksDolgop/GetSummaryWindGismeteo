// ==UserScript==
// @name         Get summary wind
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Собирает сумму ветров от направлений
// @author       AleksDolgop
// @match         https://www.gismeteo.ru/diary/*/*/*/
// @grant        none
// @require https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.min.js
// ==/UserScript==

// https://www.chartjs.org/docs/latest/getting-started/usage.html
// https://www.chartjs.org/docs/latest/getting-started/usage.html

let lastReadedData = null;
let preData = null;

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
    document.removeChild(oldRose);
  }
  const roseDiv = document.createElement('div');
  roseDiv.id = 'tempRoseDataBlock';
  roseDiv.style.position = 'fixed';
  roseDiv.style.bottom = 0;
  roseDiv.style.right = 0;
  roseDiv.style.backgroundColor = '#fff';
  roseDiv.style.border = '1px solid black';
  roseDiv.style.height = '200px';
  roseDiv.style.width = '200px';
  roseDiv.style.zIndex = 1000;
  roseDiv.style.marginBottom = '10px';
  roseDiv.style.marginRight = '10px';

  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'tempWindRoseGraph';
  newCanvas.style.width = '200px';
  newCanvas.style.height = '200px';

  let massData = Object.keys(lastReadedData).map(key => lastReadedData[key]);
  const sum = allSum(...massData);
  massData = massData.map(item => Math.round((item * 100) / sum));
  console.log(massData)
  var myRadarChart = new window.Chart(newCanvas, {
    type: 'radar',
    data: {
      labels: Object.keys(lastReadedData),
      datasets: [
        {
          label: '',
          data: massData,
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)',
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
      // scale: {
      //   ticks: {
      //     display: false,
      //   },
      // },
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
  const data_block = document.getElementById('data_block');
  if (!data_block) {
    console.log('No table data');
    return;
  }
  const table = data_block.children[2].children[1];
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
  for (const elem of table.children) {
    const ttt = elem.children[5].textContent.slice(0, 2).trim();
    if (dArr.includes(ttt)) {
      data[ttt]++;
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
  newDiv.style.bottom = 0;
  newDiv.style.left = 0;
  newDiv.style.backgroundColor = '#fff';
  newDiv.style.border = '1px solid black';
  newDiv.style.height = '215px';
  newDiv.style.width = '60px';
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
  newA.onclick = sumAll;
  newDiv.appendChild(newA);

  printPreData();
  document.body.appendChild(newDiv);

  repaintWindRose();
})();
