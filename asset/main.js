class Batry_Chart{
    constructor(){
        this.time=[]; 
        this.batry=[];
        this.chart = document.getElementById('chart');
        this.offset=0;
        this.scope=24;
        this.get_text();
        this.get_api(this.offset, this.scope);
    }
    get_text(){
        fetch('./battery').then((data)=>{
            
            return data.text()
        }).then((data)=>{
            var tmp = data.trim().split('\n');
            for(var i=0; i<tmp.length; i++){
                var bp = tmp[i].split(' ');
                this.time.push(Number(bp[0]));
                this.batry.push(Number(bp[1]));
            }
    });
    }

    get_api(start, hour){
        let pre_time = Number(new Date())/1000
        let s = Math.round(pre_time-(start+hour)*3600)
        let e = Math.round(pre_time-start*3600)
        this.data_x_range=[s*1000,e*1000];
        this.data_y_range=[0,100];
        
        let url=`./api/chart/${s}/${e}`;
        console.log('get_api',url,s,e);

        fetch(url).then((data)=>{
            //console.log(data.status)
            if(data.status!=200) return '[]';
            return data.text()
        }).then((data)=>{
            //console.log('받은양',data.length);
            this.data=eval(data)
            this.drow_svg();
        })

    }
    x(val){
        return Math.floor((val-this.data_x_range[0])/(this.data_x_range[1]-this.data_x_range[0])*this.width);
    }

    
    y(val){
        return Math.floor((this.data_y_range[1]-val)/(this.data_y_range[1]-this.data_y_range[0])*this.height);
    }
    drow_svg(){
        this.width = screen.width-20;
        this.height = 320;

        this.chart.innerHTML=`<svg style="overflow: hidden;" width="${this.width}" height="${this.height}">
            <g class="x축"></g>
            <g class="y축"></g>
            <g class='범례'></g>
            <g class="경로"></g>
        </svg>`

        // 축그리기.
        var dx = `M${0} ${0} L${0} ${this.height} L${this.width} ${this.height}`;
        var x_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        x_path.setAttributeNS(null, 'd', dx);
        x_path.setAttributeNS(null, 'stroke', 'black');
        x_path.setAttributeNS(null, 'fill', 'none');
        x_path.setAttributeNS(null, 'stroke-width', "0.8px");
        this.chart.getElementsByClassName('x축')[0].appendChild(x_path);

        this.drow_x();
        this.drow_y();
        
        if(!this.data.length) return;
        var d = `M${this.x(this.data[0][0])} ${this.y(this.data[0][1])} `
        for (var i=1; i<this.data.length; i++){
            d+=`L${this.x(this.data[i][0])} ${this.y(this.data[i][1])}`;
            //console.log(d)
        }

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttributeNS(null, 'd', d);
        path.setAttributeNS(null, 'stroke', 'blue');
        path.setAttributeNS(null, 'fill', 'none');
        path.setAttributeNS(null, 'stroke-width', "2px");
        this.chart.getElementsByClassName('경로')[0].appendChild(path);

        

        // [0,3,6].forEach((v)=>{
        //     var xind = Math.floor((this.data_x_range[1]-this.data_x_range[0])*(v/10)+this.data_x_range[0]);
        //     var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        //     text.innerHTML = `${(new Date(xind)).toString().substr(0,24)}`
        //     text.setAttributeNS(null, 'x', this.x(xind));
        //     text.setAttributeNS(null, 'y', this.height-10);
        //     text.setAttributeNS(null, 'style', 'font-size:8pt')
        //     this.chart.getElementsByClassName('범례')[0].appendChild(text)
        // })
    }
    drow_x(){
        var view_dis = (this.data_x_range[1]-this.data_x_range[0])*(25/this.width);
        //console.log('view_dis',view_dis);
        var time_dis = [60,60*10, 3600,3600*3,3600*6, 3600*24,3600*24*7, 3600*24*30, 3600*24*30*365]
        var time_fn = ['getMinutes','getMinutes','getHours','getHours','getHours','getDate','getDate','getMonth','getFullYear']
        
        var time_name = ['분','분','시','시','시','일','일','월','년'];
        var time_offset=time_name.map((v)=>v=='월');
        var time_id=[];
        var tmp=0;
        for (var i=0; i<time_name.length; i++){
            tmp+=((i==0||time_name[i]==time_name[i-1])?0:1)
            time_id.push(tmp);
        }
        
        var pre_time_id=-1
        var pre_time_id_start=0

        var dorw_x_line_flag = true; // y축 보조선 그을지 여무. 처음 1회만 그어야.

        for(var i=0; i<time_dis.length; i++){
            //console.log('for',view_dis , time_dis[i]*1000)
            if(view_dis < time_dis[i]*1000){
                //console.log(pre_time_id, time_id[i])
                var can_drow_text = (pre_time_id != (time_id[i]))

                //console.log('dd',i,'can_drow_text',can_drow_text,'dorw_x_line_flag',dorw_x_line_flag);
                
                pre_time_id = time_id[i]

                var srt_date = this.data_x_range[0];
                var srt_date_obj = new Date(srt_date);
                if(time_id[i]<=2) srt_date = Math.floor(srt_date/(time_dis[i]*1000))*(time_dis[i]*1000);
                else if(time_id[i]==3) srt_date = Number(new Date(srt_date_obj.getFullYear(), srt_date_obj.getMonth()))
                else if(time_id[i]==4) srt_date = Number(new Date(srt_date_obj.getFullYear(),0))

                if(time_id[i]==2) srt_date += (srt_date_obj.getTimezoneOffset())*60*1000;
                
                while(srt_date<=this.data_x_range[1]){
                    console.log('while',time_id[i], time_name[i],srt_date, this.data_x_range[1])
                    
                    if(dorw_x_line_flag){
                        pre_time_id_start=pre_time_id;
                        var dy = `M${this.x(srt_date)} ${0} L${this.x(srt_date)} ${this.height}`;
                        //console.log('dy',dy);
                        var y_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        y_path.setAttributeNS(null, 'd', dy);
                        y_path.setAttributeNS(null, 'stroke', 'rgb(200, 200, 200)');
                        y_path.setAttributeNS(null, 'fill', 'none');
                        y_path.setAttributeNS(null, 'stroke-width','0.5px');
                        this.chart.getElementsByClassName('y축')[0].appendChild(y_path);
                    }
                    
                    if(can_drow_text){
                        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        var val = (new Date(srt_date))[time_fn[i]]()+time_offset[i]+time_name[i];
                        //console.log('val',val,time_offset[i])
                        text.innerHTML = `${val}`;
                        text.setAttributeNS(null, 'x', this.x(srt_date));
                        text.setAttributeNS(null, 'y', this.height-4-12*(pre_time_id-pre_time_id_start));
                        text.setAttributeNS(null, 'style', 'font-size:8pt')
                        this.chart.getElementsByClassName('범례')[0].appendChild(text);
                    }
                    //console.log('da',srt_date)
                    
                    if(time_id[i]<=2)  srt_date += time_dis[i]*1000;
                    else{
                        srt_date_obj = new Date(srt_date);
                        //console.log(srt_date_obj)
                        if(time_id[i]==3) srt_date = Number(new Date(srt_date_obj.getFullYear(), srt_date_obj.getMonth()+1))
                        else if(time_id[i]==4) srt_date = Number(new Date(srt_date_obj.getFullYear()+1,0))
                        //console.log('da',srt_date)
                    }
                    
                    
                }
                dorw_x_line_flag = false;
            }
        }
    }
    drow_y(){
        [1,2,3,4,5,6,7,8,9,10].forEach((v)=>{
            var val = Math.floor(v/10*(this.data_y_range[1]-this.data_y_range[0])+this.data_y_range[0])

            var dx = `M${0} ${this.y(val)} L${this.width} ${this.y(val)}`;
            //console.log('dy',dx);
            var x_path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            x_path.setAttributeNS(null, 'd', dx);
            x_path.setAttributeNS(null, 'stroke', 'rgb(200, 200, 200)');
            x_path.setAttributeNS(null, 'fill', 'none');
            x_path.setAttributeNS(null, 'stroke-width','0.5px');
            this.chart.getElementsByClassName('y축')[0].appendChild(x_path);

            var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.innerHTML = `${val}`;
            text.setAttributeNS(null, 'x', 0);
            text.setAttributeNS(null, 'y', this.y(val)+12);
            text.setAttributeNS(null, 'style', 'font-size:8pt')
            this.chart.getElementsByClassName('범례')[0].appendChild(text);
        })
    }
    drow_all_by_c3(){
        var t_tmp = this.time.slice();
        var b_tmp = this.batry.slice();
        t_tmp.unshift('x');
        b_tmp.unshift('data1');
        console.log(b_tmp, t_tmp)
        
    this.chart = c3.generate({
        bindto: '#chart',
        data: {
            x: 'x',
            columns: [
                t_tmp,
                b_tmp
            ]
        }
        });
    }

    zoom(left, up){
        console.log('HI--HI',left,up);
        if(isNaN(left*up)) return;

        let tmp_offset = this.offset + left*(this.scope/3);
        let tmp_scope = this.scope*Math.exp(up);

        console.log('tmp_offset',tmp_offset,tmp_scope);


        this.offset = tmp_offset;
        this.scope = tmp_scope;

        this.get_api(this.offset, this.scope);
    }
}