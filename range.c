#include<stdio.h>
#define INF 2147483647
long long int hxstr2num(unsigned char* argv){
    long long int out=0;
    for(long long int i=0; i<6; i++)
        out+=(long long int)(argv[5-i])*((long long int)1<<(i*8));
        //argv[5-i]>0?argv[5-i]:argv[5-i]+256
        //printf("=> %d %lld\n",argv[5-i]>0?argv[5-i]:argv[5-i]+256,out);   
    return out;
}

long long int str2num(char* argv){
    long long int out=0;
    for (int i=0; argv[i]; i++){
        out*=10;
        out+=argv[i]-'0';
    }
    return out;
}

int main(int argc, char *argv[] ){ /// 입력은, 초단위로.... 500개 나눌꺼임. range [프린트:p, 아니면 아무거] [처음] [끝]
    
    int is_print = *argv[1]=='p';
    long long int start=str2num(argv[2])*1000, end=str2num(argv[3])*1000, rate=(end-start)/500, cnt=0, pre=0, ppre=0;

    //if(is_print) printf("is_print: %d\n",is_print);
    if(is_print) printf( "argc:     %d\n", argc );
    if(is_print) printf( "argv[0]:  |%s| |%s| |%s| |%s|\n", argv[0], argv[1], argv[2], argv[3]);
    if(is_print) printf("input, %lld to %lld, rate:%lld\n",start, end, rate); // 구간으로 나눈뒤, 각 구간에서 처음, 끝, 최대, 최소 찾기.
//int main(){
    FILE *fp = fopen(".//bt_backup.dat", "rb"); 

    if(!fp){
        printf("file fopen failed");
        return 0;
    }
    int count=0, size=0;
    
    int start_flag=1;
    int end_flag=1;
    int bt=0, l_b=0; //이전베터리양, 현재배터리양
    long long int l_t = 0, k; //이전시각, 현재시각

    int ps_min=INF, ps_max=-INF;
    long long int pt_min=-1, pt_max=-1;
    long long int filelen = 0;
    char buffer[9];
    printf("[");
    
    //이진탐색 개념 넣기..
    
    fseek(fp, 0, SEEK_END);
    filelen = ftell(fp) >>3 ;
    if(is_print) printf("len %lld",filelen);
    fseek(fp,0, SEEK_SET);
    long long int s=0, e= filelen, f=0, v=start;
    while((e-s)>1){
        f=((e-s)>>1)+s;
        if(is_print) printf("while binary %d, %d, %d\n",s,e,f);
        fseek(fp, f<<3, SEEK_SET);
        count = fread(buffer, sizeof(char), 8, fp);
        k = hxstr2num(buffer);
        if(k<=v) s=f;
        else e=f;
    }
    fseek(fp, s<<3, SEEK_SET ); // 시작 위치로 버퍼 움직임.
    

    

    while (feof(fp) == 0){
        //if(is_print) printf(">> cnt: %d\n",cnt);

        //if(is_print) printf("fp: %p %d\n",fp,feof(fp));
        count = fread(buffer, sizeof(char), 8, fp);
        size+=count;
        //if(is_print) printf("size:%d, fp: %p feof: %d, ferror:%d, count:%d\n",size, fp,feof(fp), ferror(fp), count); 
        k = hxstr2num(buffer); // 현재시각
        bt = buffer[6]; // 배터리양 
        //printf("big, %lld\n",k-start);


        if (k>=start && k<=end){ // 중간과정.

            ppre = ((k-start)*1200)/(end-start);
            //if(is_print) printf("pre: %lld, ppre: %lld k, %lld k-s %lld %lld e-s %lld %lld %lld\n",pre, ppre, k ,start, k-start, end, end-start,(k-start)*1200 );

            if(start_flag){
                if(l_t) printf("[%lld,%d],",l_t,bt);
                start_flag=0;
            }
            else if(ppre==pre){
                
                if(ps_min>bt){
                    ps_min=bt;
                    pt_min=k;
                }
                if(ps_max<bt){
                    ps_max=bt;
                    pt_max=k;
                }
            }
            else{ // 바뀜.
                //puts("changed");
                if(pt_min<pt_max){
                    if(pt_min!=-1) printf("[%lld, %d],",pt_min, ps_min);
                    if(pt_max!=-1) printf("[%lld, %d],",pt_max, ps_max);
                }else{
                    if(pt_max!=-1) printf("[%lld, %d],",pt_max, ps_max);
                    if(pt_min!=-1) printf("[%lld, %d],",pt_min, ps_min);
                }
                printf("[%lld,%d],",k, bt);
                
                pre=ppre;
                ps_min=INF, ps_max=-INF;
                pt_min=-1, pt_max=-1;
            }
        }
        else if(k>end && end_flag){
            printf("[%lld,%d],",k, bt);
            if(is_print) printf("pre cnt:: %d",cnt);
            end_flag=0;
            break;
        }
        l_t=k;
        cnt++;
    }
   
    printf("]");
    fclose(fp);    // 파일 포인터 닫기
}