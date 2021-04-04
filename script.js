// ==UserScript==
// @name         Get summary wind
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Собирает сумму ветров от направлений
// @author       AleksDolgop
// @match         https://www.gismeteo.ru/diary/*/*/*/
// @grant        none
// ==/UserScript==

// https://www.gismeteo.ru/diary/205920/2019/12/

function copyToClipboard(str) {
  var area = document.createElement('textarea');

  document.body.appendChild(area);
  area.value = str;
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
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
    СЗ: 0,
    В: 0,
    З: 0,
    ЮЗ: 0,
    ЮВ: 0,
    Ю: 0,
  };
  for (const elem of table.children) {
    const ttt = elem.children[5].textContent.slice(0, 2).trim();
    if (dArr.includes(ttt)) {
      data[ttt]++;
    }
  }
  let count = 0;
  for (const key in data) {
    count += data[key];
  }
  const newDiv = document.createElement('div');
  let newPre = document.createElement('pre');
  newPre.textContent = 'Sum:\n';
  newPre.style.textAlign = 'left';
  newPre.textContent += Object.keys(data)
    .map(key => `${key}: ${data[key]}`)
    .join('\n');
  newDiv.appendChild(newPre);

  newDiv.id = 'tampDataBlock';
  newDiv.style.position = 'fixed';
  newDiv.style.bottom = 0;
  newDiv.style.left = 0;
  newDiv.style.backgroundColor = '#fff';
  newDiv.style.border = '1px solid black';
  newDiv.style.height = '180px';
  newDiv.style.width = '50px';
  newDiv.style.zIndex = 1000;
  newDiv.style.paddingLeft = '10px';
  newDiv.style.marginBottom = '10px';
  newDiv.style.marginLeft = '10px';

  const newA = document.createElement('a');
  newA.textContent = 'copy';
  newA.href = '#';
  newA.style.textDecoration = 'none';
  newA.onclick = copyToClipboard(newPre.textContent);

  newDiv.appendChild(newA);

  document.body.appendChild(newDiv);
  

  console.log(JSON.stringify(data));
  console.log('Days:', count);
  console.log(
    Object.keys(data)
      .map(key => `${key}: ${data[key]}`)
      .join('\n')
  );
})();
