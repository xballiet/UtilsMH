// ==UserScript==
// @name        MH - Raistlin - Previous/Next Msg
// @namespace   MH
// @description Boutons "Message suivant" et "Message precedent" dans la fenetre de lecture des messages
// @include     */Messagerie/ViewMessage.php*
// @include     */Messagerie/ViewMessageBot.php*
// @include     */Messagerie/ViewMessageAlliance.php*
// @icon        https://xballiet.github.io/ImagesMH/MZ.png
// @version     1.9
// @grant       none
// @require     https://greasyfork.org/scripts/24178-mh-h2p-code-mutualis%C3%A9/code/MH%20-%20H2P%20-%20Code%20Mutualis%C3%A9.user.js?version=153518&d=.user.js
// ==/UserScript==

// Script MZ pour rajouter les boutons "Message suivant" et "Message précédent" dans la fenêtre de lecture des messages
var urlMessageCourant;
var listeMessages;

// Ajout des KeyHandlers
function keyHandler(e) {
	// DOM_VK_ESCAPE = 27 correspond à la touche Esc
	if ((e.keyCode == 27) && (window.opener != null)) {
		window.close();
	}
}

// Récupérer la liste des URLs de messages depuis la page précédente sous forme de tableau
function getMessagesList() {
	var maListe = new Array();
	var fenetreSource = window.opener;
	if (fenetreSource == null || fenetreSource.document == null) {
		return false;
	} else {
		documentSource = fenetreSource.document;
	}
	var listeElems = documentSource.evaluate("//table//tr[descendant::a[starts-with(@href, 'ViewMessage')]]", documentSource, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	var isNew = false;
	var elemCourant = listeElems.iterateNext();
	while (elemCourant) {
		var newMsg = documentSource.evaluate(".//td//img[contains(@src, 'New.gif')]", elemCourant, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if (newMsg.singleNodeValue != null) {
			isNew = true;
		} else {
			isNew = false;
		}
		var viewMsg = documentSource.evaluate(".//td//a[starts-with(@href, 'ViewMessage')]", elemCourant, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if (viewMsg != null) {
			maListe.push(new Array(viewMsg.singleNodeValue.href, isNew));
		}
		elemCourant = listeElems.iterateNext();
	}
	return maListe;
}

// Créer un bouton ou un espace (direction : g = Précédent et d = Suivant)
function addButton(parent, direction, unread, title, cible) {
	var bouton;
	if (cible == null) {
		bouton = document.createTextNode('');
	} else {
		bouton = document.createElement('IMG');
		var sourceImg = '';
		if (unread) {
			sourceImg = 'https://games.mountyhall.com/mountyhall/Images/New.gif';
		} else {
			sourceImg = 'https://games.mountyhall.com/MH_Packs/packMH_parchemin/fleches/fleche' + direction + '.jpg';
		}
		bouton.setAttribute('src', sourceImg);
		bouton.setAttribute('name', cible[0]);
		bouton.setAttribute('title', title);
		bouton.addEventListener('click', getOtherMessage, false);
	}
	var td = document.createElement('TD');
	td.setAttribute('align', 'center');
	td.setAttribute('width', '25%');
	td.appendChild(bouton);
	parent.appendChild(td);
}

// Trouver le message suivant et le message précédent dans la liste
function getSurroundingMessages(urlMessage, listeMessages) {
	var retourArray = new Array();
	for (i = 0 ; i < listeMessages.length ; i++) {
		if (listeMessages[i][0] == urlMessage) {
			if (i > 0) {
				retourArray[0] = listeMessages[i - 1];
			}
			if (i < listeMessages.length - 1) {
				retourArray[1] = listeMessages[i + 1];
			}
		}
	}
	return retourArray;
}

// Trouver le message suivant et le message précédent non-lus dans la liste
function getSurroundingUnreadMessages(urlMessage, listeMessages) {
	var retourArray = new Array();
	var tmpArray = new Array();
	// On récupère uniquement les nouveaux messages
	for (var i = 0 ; i < listeMessages.length ; i++) {
		if (listeMessages[i][1] || (listeMessages[i][0] == urlMessage)) {
			tmpArray.push(listeMessages[i]);
		}
	}
	// Et on fait comme avant
	for (var i = 0 ; i < tmpArray.length ; i++) {
		if (tmpArray[i][0] == urlMessage) {
			if (i > 0) {
				retourArray[0] = tmpArray[i - 1];
			}
			if (i < tmpArray.length-1) {
				retourArray[1] = tmpArray[i + 1];
			}
		}
	}
	return retourArray;
}

// Fermer le message en cours, ouvrir le message depuis la fenêtre mère
function getOtherMessage(e) {
	window = window.opener.open(e.target.name, 'MsgView');
	window.focus();
}

// Écoute des touches pressées
document.addEventListener('keypress', keyHandler, true);

urlMessageCourant = window.self.location.toString();
listeMessages = getMessagesList();

// Rajout des flèches en haut de page
var arrowTable = document.createElement('DIV');
arrowTable.setAttribute('id', 'arrows');
var form = document.getElementsByName('msgForm')[0];
form.insertBefore(arrowTable, form.firstChild);

var maTable = document.createElement('table');
maTable.setAttribute('width', '98%');
maTable.setAttribute('border', '0');
maTable.setAttribute('bgcolor', '#000000');
maTable.setAttribute('align', 'center');
maTable.setAttribute('cellpadding', '2');
maTable.setAttribute('cellspacing', '1');
maTable.setAttribute('id', 'arrowTable');

var mytbody = document.createElement('tbody');
maTable.appendChild(mytbody);

arrowTable.appendChild(maTable);
var tr = document.createElement('TR');
tr.setAttribute('bgcolor', '#CED2F7');
tr.setAttribute('class', 'mh_tdpage');
tr.setAttribute('align', 'center');
mytbody.appendChild(tr);

// On affiche les boutons ou des espaces vides
var surroundings = getSurroundingMessages(urlMessageCourant, listeMessages);
var surroundingsUnread = getSurroundingUnreadMessages(urlMessageCourant, listeMessages);
addButton(tr, 'g', true,  'Précédent non-lu', surroundingsUnread[1]);
addButton(tr, 'g', false, 'Précédent',        surroundings[1]);
addButton(tr, 'd', false, 'Suivant',          surroundings[0]);
addButton(tr, 'd', true,  'Suivant non-lu',   surroundingsUnread[0]);