/**
 *   ЭЛЕКТРОННЫЙ ЖУРНАЛ «ШКАЛА»: ИНИЦИАЛИЗАЦИЯ КОНСТАНТ И ФУНКЦИЙ
 * 
 *   Copyright © А. М. Гольдин, 2019. a@goldin.su
 *   Лицензия CC BY-NC-ND Version 4.0
 *   https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.ru
 */
"use strict";

/* БЛОК ОПРЕДЕЛЕНИЯ КОНСТАНТ
--------------------------------------------------------------------- */

// Наименования ролей пользователя
const roleNames = {
   "root":    "Гл. администратор",
   "admin":   "Администратор",
   "teacher": "Учитель",
   "tutor":   "Кл. руководитель",
   "pupil":   "Учащийся",
   "parent":  "Родитель"
};

// Показываемые пункты меню в зависимости от роли пользователя
const menuItems = {
   "root": [      
      ["users", "Пользователи"],
      ["admins", "Администраторы"],
      ["classes", "Классы"],
      ["subjects", "Предметы"]
   ],
   "admin": [
      ["users", "Пользователи"]
   ],
   "teacher": [
      ["tmpItem", "Затычка"]
   ],
   "tutor": [
      ["tmpItem", "Затычка"]
   ],
   "pupil": [
      ["tmpItem", "Затычка"]
   ],
   "parent": [
      ["tmpItem", "Затычка"]
   ]
};

// Список предметов по умолчанию
const subjDef = {
   "s110": "Русский язык",
   "s120": "Литература",
   "s210": "Английский язык",
   "s220": "Немецкий язык",
   "s230": "Французский язык",
   "s310": "Искусство",
   "s320": "МХК",
   "s330": "Музыка",
   "s410": "Математика",
   "s420": "Алгебра",
   "s430": "Алгебра и начала анализа",
   "s440": "Геометрия",
   "s450": "Информатика",
   "s510": "История",
   "s520": "История России",
   "s530": "Всеобщая история",
   "s540": "Обществознание",
   "s550": "Экономика",
   "s560": "Право",
   "d570": "География",
   "s610": "Физика",
   "s620": "Астрономия",
   "s630": "Химия",
   "s640": "Биология",
   "s710": "Технология",
   "s810": "Физическая культура",
   "s820": "ОБЖ"
};

/* БЛОК ОПРЕДЕЛЕНИЯ ФУНКЦИЙ
--------------------------------------------------------------------- */

// Объект функций для динамической подгрузки контента в блоки
let getContent = {};

// Просто удобное сокращение :)
const dqs = elem => document.querySelector(elem);

// Создание нового элемента section на странице с id="newId"
// и наполнение его содержимым inner
let elems = {};
const createSection = (newId, inner) => {
   elems[newId] = document.createElement("section");
   elems[newId].id = newId;
   elems[newId].innerHTML = inner;
   dqs("#content").appendChild(elems[newId]);
};

// Сортировка массива названий классов правильным образом (11А > 1А)
const classSort = classArr => classArr.map(x => x.padStart(3, '0')).sort()
                . map(x => x.replace(/^0/, ''));

// Сортировка списка предметов правильным образом по ключам (d480 > s110)
const subjSort = sbObj => sbObj;

// Экспорт функций и других объектов для среды nodejs
if (typeof(module) !== "undefined") {
   module.exports.subjDef = subjDef;   
};
