/* limit checking */
#include<stdio.h>
#include<unistd.h>
#include<sys/types.h>
#include<signal.h>
#include<errno.h>
#include<stdlib.h>
#include<sys/wait.h>

int system1(const char *cmdstr){
	int status = 0;
	pid_t pid;
	if(cmdstr == NULL) status = -1;
	
	if((pid = fork()) < 0 ){
		status = -1;
	}else if(pid == 0){
		execl("/bin/sh","sh","-c",cmdstr,NULL);
		_exit(127);
	}else{
		while(waitpid(pid,&status,0)<0){
			if(errno != EINTR) status = -1;
			break;
		}
		return status;	
	}
}
void callme(int sig_int){
	printf("%d",sig_int);
}
int main(int argc , char * argv[]){
	struct sigaction action;
	action.sa_handler = callme;
	signal(SIGALRM,SIG_IGN);
	sigaction(SIGALRM,&action,0);
	alarm(4);
	sleep(10);
return 0;	
} 
