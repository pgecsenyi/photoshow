var openedPopups = [];

function closePopups() {
  for (let i = 0; i < openedPopups.length; i++) {
    openedPopups[i].popup.style.display = 'none';
  }
  openedPopups = [];
  document.removeEventListener('click', closePopups);
}

function setPosition(popup, origin) {
  var leftPosition = origin.offsetLeft + (origin.offsetWidth - popup.offsetWidth) / 2;
  popup.style.left = leftPosition.toString() + 'px';

  var originRect = origin.getBoundingClientRect();
  var topPosition = originRect.top - popup.offsetHeight - 10;
  popup.style.top = topPosition.toString() + 'px';
}

function setPositionForOpenedPopups() {
  for (let i = 0; i < openedPopups.length; i++) {
    setPosition(openedPopups[i].popup, openedPopups[i].origin);
  }
}

function showPopup(event) {
  var origin = event.srcElement;
  var popupId = origin.getAttribute('popup');
  if (!popupId) {
    return;
  }
  var popup = document.getElementById(popupId);
  if (!popup) {
    return;
  }
  if (popup.style.display && popup.style.display !== 'none') {
    popup.style.display = 'none';
    return;
  }
  popup.style.display = 'block';
  setPosition(popup, origin);
  openedPopups.push({ 'popup': popup, 'origin': origin });
  setTimeout(function () { document.addEventListener('click', closePopups); }, 100);
}

window.addEventListener('resize', setPositionForOpenedPopups);

module.exports = {
  'showPopup': showPopup
};
