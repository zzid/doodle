export const formatPrice = (price: number) => {
    if (price >= 100000000) {
        const eok = Math.floor(price / 100000000);
        const man = Math.floor((price % 100000000) / 10000);
        return `${eok}억${man > 0 ? " " + man + "만" : ""} 메소`;
    }

    if (price >= 10000) {
        const man = Math.floor(price / 10000);
        return `${man}만 메소`;
    }

    return `${price.toLocaleString()} 메소`;
};
