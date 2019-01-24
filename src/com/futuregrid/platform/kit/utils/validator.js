class validator {

    isDeviceKey(param) {
        var patt = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;
        return patt.test(param);
    }

    static buildFactory() {
        validator.instance = new validator();
        return validator.instance;
    }
}
export {
    validator as
    default
}