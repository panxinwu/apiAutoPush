const lineReader = require('line-reader')
const request = require('request')
const fs = require('fs')
let dataArr = []
let apiDataFinal = []
let resultData = ''
let apiDataPromise = []
const readData = () => {
    return new Promise((resolve, reject) => {
        lineReader.eachLine('data.txt', function(line,last) {
            dataArr.push(line)
            if(last){
                resolve(dataArr)
            }
        })
    })
}
const filterData = (data) => {
	return new Promise((resolve, reject) => {
		let str = ''
		data.forEach((item,i) => {
			if((i+1)%2 === 0){
				str += item
				apiDataFinal.push(str)
				str = ''
			}else{
					str = item + '\n'
			}
			if(i === 19999){
				resolve(apiDataFinal)
			}
		})
	})
}
const getData = (data) => {
	return new Promise((resolve, reject) => {
		let num = 0;
		let clock = setInterval(() =>{
			if(num === data.length){
				clearInterval(clock)
				resolve()
				return
			}
			const r = request.post('http://www.csbio.sjtu.edu.cn/cgi-bin/PlantmPLoc.cgi', function optionalCallback(err, httpResponse, body) {
				let reg1 = /<tr align=center><td><font size=4pt>.*(?=\t)/g
				let reg2 = /color='#5712A3'>.+?(?=<\/font)/g
				let k1 = body.match(reg1)[0].split('4pt>')[1]
				let k2 = body.match(reg2)[0].split('>')[1]
				console.log(num);
				console.log(k1 + ' : '+k2);
				resultData+=(k1 + ' : '+k2 + '\n')
				
			})
			var form = r.form();
			form.append('mode', 'string')
			form.append('S1', data[num])
			form.append('B1', 'Submit')
			num++
		},5000)
	})
}
const writeResult = () => {
	return new Promise((resolve, reject) => {
		console.log('执行完毕',resultData.length)
		fs.writeFile('result.txt',resultData, (err) => {
			if(!err) resolve()
			console.log(err);
		});
	})
}
const apiPush = async () => {
  await readData()
	await filterData(dataArr)
	console.log('样本共',apiDataFinal.length, '条数据，需执行', apiDataFinal.length*5, '秒')
	await getData(apiDataFinal)
	console.log('resultData:',resultData);
  await writeResult()
};
apiPush()