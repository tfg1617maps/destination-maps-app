var app = {

  // Url/Path to the augmented reality experience you would like to load
  arExperienceUrl: "www/world/index.html",
  // The features your augmented reality experience requires, only define the ones you really need
  requiredFeatures: [ "geo" ],
  // Represents the device capability of launching augmented reality experiences with specific features
  isDeviceSupported: false,
  // Additional startup settings, for now the only setting available is camera_position (back|front)
  startupConfiguration:
  {
      "camera_position": "back",
      "camera_resolution": "auto"
  },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        app.wikitudePlugin = cordova.require("com.wikitude.phonegap.WikitudePlugin.WikitudePlugin");
        // set a callback for android that is called once the back button was clicked.
        if ( cordova.platformId == "android" ) {
            app.wikitudePlugin.setBackButtonCallback(app.onBackButton);
        }
    },
    // --- Wikitude Plugin ---
    loadExampleARchitectWorld: function() {
      app.prepareArchitectWorld(function() {
        app.loadARchitectWorld();
      });
    },
    prepareArchitectWorld: function(successCallback) {
        app.wikitudePlugin.isDeviceSupported(function() {
            app.wikitudePlugin.requestAccess(
                function() {
                    successCallback();
                },
                function(error) {
                    /* The error object contains two error messages.
                        * userDescription is a end user formatted message that can be displayed with e.g. a JS alert
                        * developerDescription is a developer formatted message with more detailed information about the error
                     */
                    /* Here, the userDescription is used to show a confirmation box which, in case of a positive result, shows the applications settings so that user can grant access. */
                    var openAppSettings = confirm(error.userDescription + '\nOpen App Settings?');
                    if ( openAppSettings == true ) {
                        app.wikitudePlugin.openAppSettings();
                    }
                },
                app.requiredFeatures);
        }, function(errorMessage) {
            alert(errorMessage);
        },
        app.requiredFeatures);
    },
    // Use this method to load a specific ARchitect World from either the local file system or a remote server
    loadARchitectWorld: function() {
        app.wikitudePlugin.loadARchitectWorld(function successFn(loadedURL) {
                /* Respond to successful world loading if you need to */
                /* in case the loaded Architect World belongs to the 'obtain poi data from application model' example, we can now safely inject poi data. */
            }, function errorFn(error) {
                alert('Loading AR web view failed: ' + error);
            },
            app.arExperienceUrl, app.requiredFeatures, app.startupConfiguration);
    },
    onBackButton: function() {
        /* Android back button was pressed and the Wikitude PhoneGap Plugin is now closed */
    },
};

app.initialize();
