module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Add web-specific configurations for react-native-web
      ...(process.env.EXPO_TARGET === "web"
        ? [
            "react-native-web",
            // Add polyfills or transformations for problematic native modules
            [
              "module-resolver",
              {
                alias: {
                  "react-native-maps": "./src/components/CrossPlatformMapView",
                  // Add more problematic modules as needed
                },
              },
            ],
          ]
        : []),
    ],
  };
};
