
'use strict';


// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  const STUB=false;
  const DEFAULT_REFRESH_INTERVAL = "10";

  // STORE HANDLING
  // ------------------------------------------------------------

  function getJSONSetting(key, defaultValue) {
    return JSON.parse(getSetting(key, JSON.stringify(defaultValue)));
  }

  function setJSONSetting(key, value) {
    return setSetting(key, JSON.stringify(value));
  }

  function getSetting(key, defaultValue) {
    if (STUB) {
      return window.localStorage.getItem(key) || defaultValue;
    } else {
      return tableau.extensions.settings.get(key) || defaultValue;
    }
  }

  function setSetting(key, value) {
    if (STUB) {
      return window.localStorage.setItem(key, value);
    } else {
      return tableau.extensions.settings.set(key, value);
    }
  }

  // CUSTOM METADATA FUNCTIONS
  // ------------------------------------------------------------


  const userMetadataKey = 'userMetadata';



  /** Update the displayed settings table and the deployment ID */
  function updateSettings() {

    function updateContents(id, dataKey, defaultValue) {
      let val = getSetting(dataKey, defaultValue);
      $(id).val(val);
    }

    $('input[data-config]').each((i,input)=>{
      let $input = $(input);
      let key = $input.data('config');
      let defaultVal = $input.data('default-value');
      let val = getSetting(key, defaultVal);
      $input.val(val);
    });

    // updateContents('#radiusInput', 'radius', 30);
    // updateContents('#fontColorInput', 'fontColor', 30);
    // updateContents('#fontColorInput', 'fontColor', 30);


    let refreshInterval = getSetting('refreshInterval', DEFAULT_REFRESH_INTERVAL);
    $('#refreshInterval').val(refreshInterval);

  }

  /** Handles changing of the value for a key-value pair */
  function addRefreshIntervalChangeHandler() {

    $('#refreshInterval').change('change', function(e){
      let $this = $(this);
      let val = $this.val();
      setSetting('refreshInterval', val);
      $this.removeClass("has-change");

      updateSettings();
    }).on('input', function(e){
      let hasChange = $(this).val() !== getSetting('refreshInterval', 1);
      if (hasChange) {
        $(this).addClass("has-change");
      } else {
        $(this).removeClass("has-change");
      }

    });

    const IS_CONFIG_SELECTOR = 'input[data-config]';

    // Update the stored settings on change
    $('body').on('change', IS_CONFIG_SELECTOR, function(e){
      let $this = $(this), key = $this.data('config'), val = $this.val();
      setSetting(key, val);
      $this.removeClass("has-change");
    });


    $('body').on('input', IS_CONFIG_SELECTOR, function(e) {
      let $this = $(this);
      let key = $this.data('config'), val = $this.val();
      let defaultValue = $this.data('default-value');

      let hasChange = val.toString() !== getSetting(key, defaultValue).toString();
      console.log(val, getSetting(key, defaultValue), hasChange)
      $this[hasChange ? 'addClass' : 'removeClass']('has-change');
    });
  }



  /**
   * Initializes the UI elements of the configure dialog
   */
  function init() {
    $('#closeButton').click(closeDialog);

    updateSettings();
    addRefreshIntervalChangeHandler();

  }



  $(document).ready(function () {

    if (STUB) {
      init();
    } else {

      tableau.extensions.initializeDialogAsync()
        .then(function (openPayload) {
          console.log("[EEE] Configure loaded");
          init();
        });
    }
  });

  /**
   * Stores the selected datasource IDs in the extension settings,
   * closes the dialog, and sends a payload back to the parent.
   */
  function closeDialog() {

    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      tableau.extensions.ui.closeDialog("true");
    });
  }


})();
