// ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ПРОСМОТР ЭКСПОРТИРОВАННОГО ФАЙЛА ЭЖ
// Copyright © 2020, А.М.Гольдин. Modified BSD License
// Скрипт подписывается в каждый экспортируемый html-файл с журналом класса
"use strict";

// Получаем объект с данными журнала
let body = document.querySelector("article");
let scole = JSON.parse(body.innerHTML);

// Формируем заголовок страницы и определения стилей
let title = document.createElement("title");
title.textContent = `Журнал ${scole.className} класса`;
document.head.prepend(title);

let stl = document.createElement("style");
stl.textContent = `
   @page {size: A4 portrait; margin:1.5cm 2.5cm}
   body {width:16cm; margin:auto; font:10pt Arial, sans-serif; text-align:center}
   nav {text-align:center; margin-bottom:6pt; page-break-before:always}
   h1, h2, h3, p {text-align:center;}
   h1 {font-size:18pt; margin:0pt}
   h2 {font-size:12pt; margin:36pt 0pt 12pt}
   h2:first-of-type {font-size:10pt; margin:12pt 0pt 0pt}
   h3 {font-size:12pt; margin:0pt 0pt 12pt}
   p {margin:48pt 0pt; border-top:0.25pt solid black}
   button {position:fixed; top:5px; right:20px; font-size:24pt; display:none;}
   
   /* Оглавление */
   section p {text-align:left; margin:3pt 0pt; border:none}
   section b {display:inline-block; width:3em; text-align:right}
   
   /* Последняя страница */
   aside {width:10cm; margin:auto; padding-top:5cm; page-break-before:always}
   aside p {border:none}
   aside p:nth-child(2) {border-top:0.25pt solid black}
   aside p:nth-child(3) {text-align:left; font-style:italic}
   
   /* Таблица с отметками */
   .pupCol, .gradeCol {
      display:inline-block; width:3.5cm; border-top:0.25pt solid black;}
   .gradeCol {width:1.1cm;}
   .pupCol div, .gradeCol div {
      border-bottom:0.25pt solid black; padding:1pt 0pt; text-align:left;}
   .gradeCol div {text-align:center; border-left:0.25pt solid black;}
   .gradeCol div:first-child {font-stretch:condensed}
   
   /* Таблица с темами */
   .topicsStr {border:0.25pt solid black; border-style:none none solid}
   h3 + .topicsStr {border-top:0.25pt solid black}
   .topicsStr div {
      display:inline-block; padding:3pt; text-align:center; vertical-align:top;
      -webkit-hyphens:auto; -moz-hyphens:auto; -ms-hyphens:auto; hiphens:auto;}
   .topicsStr div:nth-child(1) {width:1cm; border-left:none}
   .topicsStr div:nth-child(2) {width:0.8cm}
   .topicsStr div:nth-child(3) {width:7cm; text-align:left}
   .topicsStr div:nth-child(4) {width:6cm; text-align:left}
   h3 + .topicsStr div:nth-child(3), h3 + .topicsStr div:nth-child(4) {
      text-align:center;}
   h3 + .topicsStr div {border-left:0.25pt solid black}
   h3 + .topicsStr div:first-child {border-left:none}
   
   @media screen {
      html {background:#ccc}
      body {background:white; margin:2cm auto; padding-top:1cm;}
      nav, aside {padding-top:12pt; border-top:5px groove #ccc; margin-top:24pt}
      aside {padding:12pt 3cm 2cm}
      button {display:block;}
   }
`;
document.head.prepend(stl);

// Формируем содержимое страницы и показываем его
let doc = `
   <button type="button" onClick="window.print()" title="Печать"
      >&#128424;</button>
   <p><small>(наименование образовательной организации)</small></p>
   <h1>Классный журнал ${scole.className} класса</h1>
   <h2>20_____/_____ учебный год</h2>
   <h2>Содержание</h2>`;

doc += `<section>{{toc}}</section>`;
let toc = '';

// Формируем колонку с фамилиями учащихся
let pupCol = "<div class='pupCol'><div>&nbsp;</div>";
for (let pupil of scole.list) pupCol += `<div>${pupil}</div>`;
pupCol += "</div>";

let pageNum = 2;

// Цикл по предметам в данном классе
for (let subjObj of scole.content) {
   
   // Формируем элемент оглавления
   let teachArr = subjObj.p.split(' '),
       teach = `${teachArr[0]} ${teachArr[1][0]}. ${teachArr[2][0]}.`;
   toc += `<p><b>${pageNum}</b>&emsp;${subjObj.s} (${teach})</p>`;
   
   // Текущая печатаемая страница (верх и низ)
   let currPageTop = '', currPageBott = '';
   
   // Цикл по всем датам (урокам) в данном предмете
   // (11 - количество записанных уроков на одной странице)
   let lessNum = 0;
   for (let lessObj of subjObj.l) {
      if (!(lessNum % 11)) {
         doc += currPageTop + currPageBott;
         currPageTop  = `<nav>${pageNum}</nav>`; pageNum++;
         currPageTop += `<h3>${subjObj.s}</h3>`;
         currPageTop += pupCol; // список учащихся
         
         currPageBott  = `<nav>${pageNum}</nav>`; pageNum++;
         currPageBott += `<h3>${subjObj.p}</h3>`;
         currPageBott += "<div class='topicsStr'>"
            + "<div>Дата</div><div>Вес</div>"
            + "<div>Содержание урока</div><div>Задание на дом</div>"
            + "</div>";
      }
      // Подписываем текущий столбик урока в таблицу с отметками
      currPageTop += `<div class='gradeCol'><div>${lessObj.d}</div>`;
      for (let gr of lessObj.g)
         currPageTop += `<div>${gr ? gr : ' '}</div>`;
      currPageTop += "</div>";
      
      // Подписываем текущую тему в таблицу с темами
      currPageBott += `<div class='topicsStr'><div>${lessObj.d}</div>`
         + `<div>${lessObj.w}</div><div>${lessObj.t.substr(0,120)}</div>`
         + `<div>${lessObj.h.substr(0,120)}</div></div>`;
      
      lessNum++;
   }   
   doc += currPageTop + currPageBott;
}

doc += "<aside><p>В настоящем журнале пронумеровано,<br>" +
   "прошнуровано и скреплено печатью</p><p>листов</p><p>Подпись:</p></aside>";

body.innerHTML = doc.replace("{{toc}}", toc);