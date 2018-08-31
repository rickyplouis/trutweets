module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
      "no-underscore-dangle": ["error", { "allow": ["_p_user", "_id"] }],
      "react/jsx-filename-extension": [0],
      camelcase: 'off',
      "react/no-danger": 'off',
      "jsx-a11y/anchor-has-content": "off"
    }
};
