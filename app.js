const express = require('express');
const app = express();
const port = 3000;
const {readFileSync, promises: fsPromises} = require('fs');
const request = require('request');
const axios = require('axios');
app.get('/setStringHdp/:value', (req, res) => {
    res.json(setStringHdp(req.params.value));
});
app.get('/merge-market', (req, res) => {
    (async () => {
        res.json(await mergeMarket().then(item => {
            return item
        }))
    })()

})
app.get('/readFile', (req, res) => {
    res.json(readFile())

});


app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
let a = {'da': 2323};

async function getBr() {
    try {
        const response = await axios.get('https://artemis-exam.secure-restapi.com/br');
        return response.data
    } catch (error) {
        console.error(error);
    }
}

async function getSbo() {
    try {
        const response = await axios.get('https://artemis-exam.secure-restapi.com/sbo');
        return response.data
    } catch (error) {
        console.error(error);
    }
}


async function mergeMarket() {
    let listBr = [];
    let listSbo = [];
    await getBr().then(data => {
        listBr = data
    });
    await getSbo().then(data => {
        listSbo = data
    });


    let listSequenceSbo = [];
    listSbo.forEach(item => {
        const data = {
            seqName: item.leagueName.en,
            marketsData: item.matches
        };
        listSequenceSbo.push(data)
    });
    let listSequenceBr = [];
    listBr.forEach(item => {
        listSequenceBr.push(item.leagueName.en)
    });


    let listSeq = new Set();
    listSequenceSbo.forEach(itemSbo => {
        listSequenceBr.forEach(itemBr => {
            if (itemSbo.seqName.toUpperCase() === itemBr.toUpperCase()) {
                const data = {
                    seqName: itemSbo.seqName.toUpperCase(),
                    marketsData: itemSbo.marketsData
                };
                listSeq.add(data)
            }

        })
    });
    let useSequence = Array.from(listSeq);
    //
    const res = listBr.filter(f => useSequence.some(item => item.seqName.toUpperCase() === f.leagueName.en.toUpperCase()));


    let seq = [];
    useSequence.forEach(item => {
        seq.push(item.seqName)
    });

    const listItem = res.sort(function (a, b) {
        return seq.indexOf(a.leagueName.en.toUpperCase()) - seq.indexOf(b.leagueName.en.toUpperCase());
    });


    listItem.forEach((item => {
        const data = useSequence.find(element => element.seqName.toUpperCase() === item.leagueName.en.toUpperCase());


        for (let i = 0; i < item.matches.length; i++) {
            const dataDetailMarket = data.marketsData.find(el => el.teams.en.home.toUpperCase() === item.matches[i].teams.en.home.toUpperCase());
            item.matches[i].markets = dataDetailMarket.markets
        }

    }));
    return listItem

}


function setStringHdp(number) {
    if (isNaN(number)) {
        return "error";
    }
    if (number % 0.25 !== 0) {
        return "error";
    }
    let checkNegative = false;
    if (number < 0) {
        checkNegative = true;
        number = Math.abs(number);
    } else {
        checkNegative = false;
    }

    if (Number(number) === 0) {
        return number.toString()
    } else if (Number(number) === parseInt(number)) {
        return parseFloat(number).toFixed(1);
    } else {
        if (number % 0.5 !== 0) {
            if (checkNegative) {
                return '-' + (parseFloat(number) - 0.25) + '/' + (parseFloat(number) + 0.25);
            } else {
                return (parseFloat(number) - 0.25) + '/' + (parseFloat(number) + 0.25);
            }

        } else {
            return number.toString();
        }
    }
}


function readFile() {
    let listItem = [];
    const contents = readFileSync('asset/20220530_readfile.txt', 'utf-8');
    const arr = contents.split(/\r?\n/);
    arr.forEach(item => {
        let listText = item.split('|');
        let check = false;
        for (let i = 0; i < listText.length; i++) {
            if (listText[i]) {
                check = true
            } else {
                check = false;
                return
            }
        }
        if (check) {
            listItem.push(listText[0] + ' ' + listText[8] + ' ' + listText[2] + ' ' + listText[3])
        }
    });
    return listItem;
}
