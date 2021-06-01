const exec = require('child_process').exec;
const fs = require("fs");
const cmd = 'WMIC PATH Win32_Battery Get EstimatedChargeRemaining'
console.log('배터리 기록 시작')

const save_as_bp = (num, pes)=>{
    b=Buffer.alloc(8)
    for (var i=0; i<6; i++){
        b[5-i]=num&255;
        num = Math.floor(num/(1<<8))
    }
    b[i]=pes;
    b[7]=10;
    return b;
}
//save_as_bp(1622194668171, 84)
a = setInterval(() => {
    exec(cmd, {encoding: 'utf8'},(err,result,stderr) => {
        //console.log(result)
        var percent = Number(result.toString().split('\n')[1].trim());
       
        var date = Number(new Date()).toString();
        
        var b= save_as_bp(date, percent);
        console.log(date, percent,b);
        fs.appendFile("bt.dat", b, (err) => {if(err) console.log(err)})
        //var log =`${date} ${percent}`;
        //fs.appendFile("battry.txt", log+'\n', err => {if(err) console.log(err)})
    })
}, 1000*60);

const port = 81;
const http = require('http')
const server = http.createServer((req,res)=>{
    const url = req.url;
    const url_arr = req.url.split('/')
    const referer = req.headers.referer;
    const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress
    
    function ok(xx){
    var a = ["\\",'//','"', "'", '<', '>', '?', '|', '*', '..', '%'];
    for (var i=0; i<a.length; i++) if (xx.includes(a[i])) return false;
    return true;
    }
    
    console.log('[ip]',ip, '[referer]', decodeURIComponent(referer),'[request]', decodeURI(url))
    
    function fs_readfile(res, url, encode, file_type, callback){
        //console.log('fs_readfile', url)
        var name = url.split('/').reverse()[0]
        var url_arr = url.split('/');
        if ( name.includes('.html')) file_type='text/html; charset=utf-8';
        if ( name.includes('.css')) file_type='text/css; charset=utf-8';
        
        fs.readFile(url, encode, (err,data)=>{
            if(err){ 
                console.error('[error] fs_readfile', err, url, encode, file_type)
                res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
                res.end('Page Not Found');
            }else{
                res.writeHead(200, {'Content-Type':file_type});
                res.end(data)
            }
        })
    callback();
    }

    
    
    function _404(res, url, err){
        //console.error('_404 fn err', url, err)
        res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});
        res.end('404 Page Not Found');
    }
    
    if(url=='/') fs_readfile(res, 'asset/index.html', 'utf-8', 'text/html; charset=utf-8', ()=>{})
    else if (url=='/main.js') fs_readfile(res, 'asset/main.js', 'utf-8', 'text/JavaScript; charset=utf-8', ()=>{})
    else if (url=='/battery') fs_readfile(res, './battery.txt', 'utf-8', 'text/txt; charset=utf-8', ()=>{})
    
    // else if (url=='/d3/d3.v5.min.js') fs_readfile(res, './d3/d3.v5.min.js', 'utf-8', 'text/JavaScript; charset=utf-8', ()=>{})
    // else if(url_arr[1]=='c3'){
    //     url_arr.shift();
    //     url_arr.shift();
    //     const file_url = url_arr.join('/');
    //     console.log('파일',file_url);
    //     if (!ok(file_url)){
    //         _404(res,url,'파일 주소 잘못.');
    //     }else{
    //         fs_readfile(res, 'c3-0.7.20/'+file_url, 'utf-8', 'text/JavaScript; charset=utf-8', ()=>{})
    //     }
    // }
    else if(url_arr[1]=='api' && url_arr[2]=='chart'){
        var [start, end] = [Number(url_arr[3]), Number(url_arr[4])];
        if(isNaN(start+end)) _404(res,url,'숫자가 아닌 값임.');
        else{
            let range_cmd = `.\\range.exe n ${start} ${end}`;
            //console.log(range_cmd);
            exec(range_cmd, {encoding: 'utf8'},(err,result,stderr) => {
                console.log('range.exe 받은 길이,',result.length);

                if(result=='file fopen failed') _404(res,url,'bt.dat fopen failed')
                else{
                    res.writeHead(200, {'Content-Type':'text/JavaScript; charset=utf-8'});
                    res.end(result);
                } 
            });
        }
    }
    else _404(res,url, 'Page Not Found, else;');
});
server.listen(port, ()=>console.log(`Server is running at localhost:${port}`));