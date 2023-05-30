export const API = (parm1 = null, parm2 = null, parm3 = null) => {
    const IP = 'http://64.226.74.210:5001'
    const APis = {
        getChartsData: `${IP}/data`,
        chartsWebSocket : `${IP}`
    };
    return APis;
};
