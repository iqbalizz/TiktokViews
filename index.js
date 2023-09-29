import axios from "axios";
import readlineSync from "readline-sync";
import chalk from "chalk";
import { Banner } from "./src/banner.js";

const getService = async () => {
    try {
        const linkServiceApi = 'http://45.77.168.105:5020/api/services'
        const res = await axios.get(linkServiceApi)

        return res.data.services;
    } catch (error) {
        console.error(error)
    }
}

const inputTarget = async (inputLinkTarget, service) => {
    try {
        const linkInputApi = 'http://45.77.168.105:5020/api/link/insert'
        const requestData = {
            url: inputLinkTarget,
            type: service
        };

        const res = await axios.post(linkInputApi, requestData)
        return res.data
    } catch (error) {
        console.error(error)
    }
}

const checkStatusOrder = async (link) => {
    try {
        const urlCheckStatus = `http://45.77.168.105:5020${link}`;
        const res = await axios.get(urlCheckStatus)
        return res.data
    } catch (error) {
        console.error(error)
    }
}

//!FUCNTION DELAY
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    // const banner = Banner()
    console.log(`${chalk.white(Banner())}`)
    const resultService = await getService()
    resultService.forEach((service, index) => {
        const serviceName = service.service_name;
        const statusService = service.status;
        console.log(`[${index + 1}] ${chalk.green(serviceName)} ${chalk.red(statusService)}`)
    });
    console.log();
    const chooseService = readlineSync.question(`[?] Masukkan pilihan service (1, 2, 3) : `);
    let service;
    // let status = false
    // while (status) {
    if (chooseService >= 1 && chooseService <= resultService.length) {
        const selectedService = resultService[chooseService - 1];
        service = selectedService.service_name;
    } else {
        console.log(`[!] ${chalk.red(`Tidak ada pilihan`)}`)
    }
    // }
    console.log(`[!] ${chalk.green(`Memilih Service ${service}!`)}`)
    const inputLinkTarget = readlineSync.question(`[?] Masukkan link target : `);
    const resultInput = await inputTarget(inputLinkTarget, service)
    if (resultInput.status === 'success') {
        console.log(`[!] ${chalk.green(resultInput.message)}`)
        const getLinkCheck = resultInput.callback;
        while (true) {
            const resultCheckStatus = await checkStatusOrder(getLinkCheck);
            if (resultCheckStatus.status === 'success') {
                const statusOrder = resultCheckStatus.data.status;
                const typeOrder = resultCheckStatus.data.type;
                const linkTarget = resultCheckStatus.data.url;
                const messageStatusOrder = resultCheckStatus.data.message;
                console.log()
                console.log(`[!] ${chalk.green(resultCheckStatus.message)}`);
                console.log(`[!] Status : ${chalk.green(statusOrder)}`);
                console.log(`[!] Input : ${chalk.green(typeOrder)}`);
                console.log(`[!] Url Target : ${chalk.green(linkTarget)}`);
                console.log(`[!] Message : ${chalk.green(messageStatusOrder)}`);
                console.log();
                if (statusOrder === 'Success') {
                    break; // Keluar dari loop jika status bukan 'Pending'
                }
            } else {
                console.log(`[!] ${chalk.red(`Gagal Check Status Order!`)}`);
                break; // Keluar dari loop jika gagal memeriksa status
            }
            await delay(3000)
        }
    } else {
        console.log(`[!] ${chalk.red(`Gagal input link target!`)}`)
    }
    // console.log(resultInput)
})();