/**
 * This optimisation would be good for performance, but 'duplicates'
 *  could become worryingly large if this extension is left running for a while.
 * If you can think of a way to fix this, please do!
 */

//var duplicates = [];
//
//function addAlreadyTested(url) {
//  duplicates.push(url);
//}
//
//function isAlreadyTested(url) {
//  if (localStorage.reloadCache === '1') {
//    console.log('CACHE reloading after change in options');
//    duplicates = [];
//    localStorage.reloadCache = '0';
//    return false;
//  }
//  return (duplicates.indexOf(url) !== -1);
//}

function disabled() {
  return (typeof localStorage.disabled !== 'undefined') && (localStorage.disabled === '1');
}

function getReplacements() {
  if (localStorage.options) {
    var options = JSON.parse(localStorage.options);
    if (options.replacements && options.replacements.length > 0) {
      return options.replacements;
    }
  }
  return false;
}

function updateButton() {
  //change the icon depending if is disabled
  var icon = disabled() ? "48-grey.png" : "48.png";
  chrome.browserAction.setIcon({path:icon});
}

/**
 * The click event when someone clicks the extension icon to dis(en)able the replacing.
 * NOTE we use string for '1' and '0' because the locastorage doesn't store other types.
 *  This means that === 1 or === true fails if we try and set to boolean.
 */
function click() {
  //if current disabled we enable, and vice-versa:
  localStorage.disabled = disabled() ? '0' : '1';
  updateButton();
}

function init() {
  //add listener for each request
  chrome.webRequest.onBeforeRequest.addListener(
    function(info) {
      var conf, search, i, subjectPriorToReplacement;
      var replacements = getReplacements();
      var subject = info.url;

      if (!replacements || disabled()/* || isAlreadyTested(info.url)*/) {
        return {};
      }

      for (i in replacements) {
        subjectPriorToReplacement = subject;
        conf = replacements[i];
        //only use regex object as the search if specified
        search = conf.regex ? new RegExp(conf.search) : conf.search;
        //String.replace takes either string or regex, so this will work with either
        subject = subject.replace(search, conf.replace);
        if (subject !== subjectPriorToReplacement) {
          console.log('MODIFICATION for ' + subjectPriorToReplacement   + ' is now ' + subject);
        }
      }
      if (subject !== info.url) {
        console.log('REDIRECTING resource from ' + info.url + ' to ' + subject);
        // if they aren't the same, we need to modify the url
        return {
          redirectUrl: subject
        };
      }
      //got to here without any change, so we don't need to test the same url again if it comes in.
//      addAlreadyTested(info.url);
      return {};
    },
    {
      urls: [
        "*://*/*"
      ]
    },
    [ "blocking" ]
  );

  //add listener for clicking the icon so it can disable the replacements
  chrome.browserAction.onClicked.addListener(click);

  //initially updating the toolbar icon
  updateButton();
}

init();

