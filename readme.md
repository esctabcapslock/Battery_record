## Battery_record (베터리 기록)

## 목적
- 베터리가 갑자기 빨리 닳는 현상이 발생함
- 현상에 대해 잘 알기 위해 만들었음.

## 구현
### 배터리잔량.js
- node.js로 실행됨.
- >WMIC PATH Win32_Battery Get EstimatedChargeRemaining
- node.js에서 위 cmd 명령어를 이용해 현재 배터리 값을 받아옴.
- 이를 바이너리로 bt.dat에 저장한다.
- 클라이언트의 요청이 있으면
- 다시, bt_backup.dat의 파일을 range.exe를 통해 읽어 전송

### range.c (exe)
- bt_backup.dat 를 읽는 용도.
- 요청할 때마다, 실행되게 만들었더니, 느리다...

### 클라이언트 (./asset)
- 클라이언트에서는 이를 바탕으로 데이터 시각화
- 키보드 키, 또는 →↓↑← 버튼으로 범위를 움직일 수 있다.