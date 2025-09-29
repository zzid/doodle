import React, { useState } from "react";
import { ExpCoupon } from "@/features/exp-coupon";

export const App = () => {
    return (
        <div className="wrapper">
            <ExpCoupon />
        </div>
    );
};

// // make this array to object. with key as the index of the array
// const requiredExp = {
//     239: 3971,
//     242: 5129,
//     245: 6740,
//     248: 7014,
//     251: 10229,
//     254: 10675,
//     257: 11154,
// }; // 239 ~ 257

// const extreamExp = {
//     239: 100,
//     242: 100,
//     245: 100,
//     248: 100,
//     251: 64.7, // 35.3
//     254: 59.2, // 40.8
//     257: 54.2, // 45.8g
// }; // 251 ~ 257

// let temp = 0,
//     tempK = "";
// const diff = Object.entries(requiredExp).reduce((obj, [key, value], i) => {
//     if (i === 0) {
//         tempK = key;
//         temp = value;
//         return obj;
//     }
//     obj[`${tempK}->${key}`] = value - temp;
//     tempK = key;
//     temp = value;
//     return obj;
// }, {});

// console.log(diff);

// const acc = Object.entries(requiredExp).reduce(
//     (obj, [key, value], i) => {
//         obj[key] = obj.acc + value;
//         obj.acc += value;
//         return obj;
//     },
//     { acc: 0 }
// );
// // 8 weeks : 24000
// // already passed 2 weeks
// // 6 weeks left : 18000
// // extra 1000 per week for 2 weeks
// // 20000

// console.log("acc : ", acc);

// const pptPerPct = Object.keys(requiredExp).reduce((obj, key, i) => {
//     obj[key] = requiredExp[key] * (extreamExp[key] / 100);
//     return obj;
// }, {});
// console.log(pptPerPct);
// // 245, 248, 251. 1 each.
