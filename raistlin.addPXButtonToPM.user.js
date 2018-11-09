// ==UserScript==
// @name        MH - Raistlin - Add PX button to PM
// @namespace   MH
// @description Ajout d'un bouton "Don de PX" dans les PM
// @include     */Messagerie/ViewMessage.php*
// @icon        https://xballiet.github.io/ImagesMH/MZ.png
// @version     1.10
// @grant       none
// @require     https://greasyfork.org/scripts/24178-mh-h2p-code-mutualis%C3%A9/code/MH%20-%20H2P%20-%20Code%20Mutualis%C3%A9.user.js?version=153518&d=.user.js
// ==/UserScript==


function appendButton(paren, value, onClick) {
	var input = document.createElement('input');
	input.type = 'button';
	input.className = 'mh_form_submit';
	input.value = value;
	input.onmouseover = function() {this.style.cursor = 'pointer';};
	if (onClick) input.onclick = onClick;
	paren.appendChild(input);
	return input;
}

function insertBefore(next, el) {
	next.parentNode.insertBefore(el, next);
}

// Récupération de la liste des destinataires + émetteur
function getPersoList() {
	var persoList = new Array();

	// Tous les liens sont des émetteurs ou des destinataires
	var listeBrute = document.getElementsByClassName("AllLinks");

	// Pour chaque lien, on récupère le premier nombre du lien : c'est le numéro de trõll
	// Pour rappel, le lien est du style : javascript:EnterPJView(61214,750,550)
	for (var i = 0 ; i < listeBrute.length ; i++) {
		tmpVar = listeBrute[i].toString().match(/\d+/);
		persoList[i] = tmpVar[0];
	}

	return persoList.join(',');
}

// Ajout du bouton de don de PX au début de la ligne des autres boutons (plus simple)
function addButton() {
	var insertPoint = document.getElementsByName('bClose')[0];

	// On crée le div du bouton
	var npButtonDiv = document.createElement('div');

	// On ajoute le bouton
	var npButton = appendButton(npButtonDiv, 'Donner des PX', sendPX);

	// On ajoute le div à la page
	insertBefore(insertPoint, npButtonDiv);
}

// Fonction utilisée quand on clique sur le bouton pour envoyer sur la page du don
function sendPX() {
	var urlCible = "/mountyhall/MH_Play/Actions/Play_a_DonPX.php?cat=8&dest=";
	var persoList = getPersoList();
	urlCible += persoList;
	if (window.opener !== null) {
		window.opener.location = urlCible;
	} else {
		window.open(urlCible);
	}
}

addButton();