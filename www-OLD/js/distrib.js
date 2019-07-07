/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: РАСПРЕДЕЛЕНИЕ ПЕДАГОГИЧЕСКОЙ НАГРУЗКИ
 *   Copyright © 2019, А.М.Гольдин. Modified BSD License
 */
"use strict";

let distrClList = [], distrClGroups = [], distrSbList = {},
    distrThList = [], distrTutList  = {}, distrObject = {};
    
// Добавление/удаление элемента учебной нагрузки
const editLoad = async (func, teacher, subj, className) => {
   let apiOpt  = {method: "POST", cache: "no-cache", body: ''},
       apiResp = '';
   
   if (func == "add") {
      let t = dqs("#distSelTeach").value;
      let s = dqs("#distSelSubj" ).value;
      let c = dqs("#distSelClass").value;
      apiOpt.body = `{
         "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}",
         "f": "distrEdit", "z": ["${func}", "${t}", "${s}", "${c}"]
      }`;
      
      if (!distrObject[t])    distrObject[t]    = {};
      if (!distrObject[t][s]) distrObject[t][s] = [];
      
      if (!distrObject[t][s].includes(c)) {
         apiResp = await (await fetch("/", apiOpt)).text();
         if (apiResp == "none") {
            info(1, "Запрашиваемая операция отклонена.");
            return;
         }
         distrObject[t][s].push(c);
      }
      else info(1, "Эти предмет и класс уже есть в нагрузке.");
   }
   else {
      apiOpt.body = `{
         "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "distrEdit",
         "z": ["${func}", "${teacher}", "${subj}", "${className}"]
      }`;
      apiResp = await (await fetch("/", apiOpt)).text();
      if (apiResp == "none") {
         info(1, "Запрашиваемая операция отклонена.");
         return;
      }
      distrObject[teacher][subj] = distrObject[teacher][subj]
                                  .filter(c => c != className);
   }
   
   setThLoadTable();
}
    
// Формирование таблицы с педагогической нагрузкой данного учителя
const setThLoadTable = () => {
   let teach   = dqs("#distSelTeach").value,
       pedLoad = distrObject[teach],
       inner   = '';
       
   if (!teach) {
      dqs("#teachLoad").innerHTML =
         "<tr><td style='border:none'>Учитель не выбран.</td></tr>";
      return;
   }
   
   if (pedLoad) {
      for (let subjKod of Object.keys(pedLoad)) {
         pedLoad[subjKod] = classSort(pedLoad[subjKod]);
         for (let currClass of pedLoad[subjKod]) {
            inner += `<tr>
               <td>${distrSbList[subjKod]}</td><td>${currClass}</td>
               <td title="Удалить"
                   onClick="editLoad('del',
                   '${teach}', '${subjKod}', '${currClass}')">&#10060;</td>
            </tr>`.replace(/\n/g, ' ');
         }
      }
   }
   inner = inner ? inner :
      "<tr><td style='border:none'>Нагрузки не найдено.</td></tr>";
      
   dqs("#teachLoad").innerHTML = inner;
}

// Назначение классного руководителя классу
const setTutor = async (className, tutorLogin) => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}",
      "f": "tutorSet", "z": ["${className}", "${tutorLogin}"]
   }`};
   let apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp == "none") {
      info(1, "Запрашиваемая операция отклонена.");
      return;
   }
}

// Формирование innerHTML селекта выбора подгрупп после пред. выбора класса
const distSelClLoad = className => {
   // Массив подгрупп данного класса (включая сам класс)
   let groups = distrClGroups.filter(x => x.includes(className));
   
   let selInner = '';
   for (let group of groups) {
      let prim = group.includes('-') ? '' : " (весь)";
      selInner += `<option value="${group}">${group + prim}</option>`;
   }
   dqs("#distSelClass").innerHTML = selInner;
}

// Формирование innerHTML таблицы "Классное руководство"
const createTutorTable = () => {
   let res = '', optList = "<option value='none'>Не назначен</option>";
   
   for (let currTeach of distrThList)
      optList += `<option value="${currTeach.login}">${currTeach.fio}</option>`;
   
   for (let currCl of distrClList) {
      let classString = `<tr>
         <td>${currCl}</td><td>
         <select onChange="setTutor('${currCl}', this.value)">
         ${optList}
         </select></td>
      </tr>`;
      if (distrTutList[currCl]) if (distrTutList[currCl] != "none")
         classString = classString.replace(
            `<option value="${distrTutList[currCl]}">`,
            `<option value="${distrTutList[currCl]}" selected>`
         );

      res += classString;
   }
   return res;
}

// Формирование контента странички
createSection("distrib", `
   <h3>Распределение педагогической нагрузки</h3>
   <select id="distSelTeach" onChange="setThLoadTable()"></select>
   <table id="teachLoad"></table>
   <select id="distSelSubj"></select>
   <select id="distSelClassPredv" onChange="distSelClLoad(this.value)"></select>
   <select id="distSelClass"></select>
   <button type="button"
      id="addTeachLoad" onClick="editLoad('add')">Добавить</button>
      
   <h3>Классное руководство</h3>
   <table id="tutTbl"><tr><td><img src="static/preloader.gif"></td></tr></table>   
`);

// Динамически подгружаем списки предметов, классов, классных руководителей
// и всех учителей (имя метода = имени пункта меню!)
getContent.distrib = async () => {
   let apiOpt = {method: "POST", cache: "no-cache", body: `{
      "t": "${uCateg}", "l": "${uLogin}", "p": "${uToken}", "f": "subjList"
   }`};
   
   // Объект со списком предметов
   let apiResp = await (await fetch("/", apiOpt)).text();
   let subjListDop = {};
   if (apiResp != "none") subjListDop = JSON.parse(apiResp);
   distrSbList = subjSort({...subjDef, ...subjListDop});
   
   // Массив со списком классов и их подгрупп
   apiOpt.body = apiOpt.body.replace("subjList", "classesGroups");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrClGroups = classSort(JSON.parse(apiResp));
   
   // Массив со списком классов (без подгрупп)
   distrClList = distrClGroups.filter(x => !x.includes('-'));
   
   // Объект со списком классных руководителей
   apiOpt.body = apiOpt.body.replace("classesGroups", "tutorsList");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrTutList = JSON.parse(apiResp);
   
   // Объект со списком всех учителей
   apiOpt.body = apiOpt.body.replace("tutorsList", "teachList");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrThList = userSort(JSON.parse(apiResp));
   
   // Объект с педагогической нагрузкой всех учителей
   // {"pupkin": {"s110": ["8Б", "10Ж"], "d830": ["8Б"]}, "ivanov": ...}
   apiOpt.body = apiOpt.body.replace("teachList", "distrGet");
   apiResp = await (await fetch("/", apiOpt)).text();
   if (apiResp != "none") distrObject = JSON.parse(apiResp);
   
   // Формируем контент таблицы с классными руководителями
   dqs("#tutTbl").innerHTML = createTutorTable();
   
   // Формируем селект выбора учителя
   let dSelThInner = "<option value=''>&#9947; Выберите учителя</option>";
   for (let teach of distrThList)
      dSelThInner += `<option value="${teach.login}">${teach.fio}</option>`;
   dqs("#distSelTeach").innerHTML = dSelThInner;
   
   // Формируем селект выбора предмета
   let dSelSbInner = '';
   for (let kod of Object.keys(distrSbList))
      dSelSbInner += `<option value="${kod}">${distrSbList[kod]}</option>`;
   dqs("#distSelSubj").innerHTML = dSelSbInner;
   
   // Формируем селект предварительного выбора класса
   let dSelClInner = '';
   for (let cls of distrClList) dSelClInner += `<option>${cls}</option>`;
   dqs("#distSelClassPredv").innerHTML = dSelClInner;
   distSelClLoad(distrClList[0]);
   
   // Очищаем таблицу с педагогической нагрузкой
   dqs("#teachLoad").innerHTML =
      "<tr><td style='border:none'>Учитель не выбран.</td></tr>";
}