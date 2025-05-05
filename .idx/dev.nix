{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.openjdk17
    pkgs.android-tools
    pkgs.gradle
    pkgs.unzip
  ];

  env = {
    JAVA_HOME = "${pkgs.openjdk17}";
    ANDROID_SDK_ROOT = "/home/user/android-sdk";
    ANDROID_HOME = "/home/user/android-sdk";
    PATH = "${pkgs.android-tools}/bin:${pkgs.gradle}/bin:$PATH";
  };

  idx = {
    extensions = [
      "angular.ng-template"
    ];

    workspace = {
      onCreate = {
        npm-install = "npm ci || npm install";
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "start" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
