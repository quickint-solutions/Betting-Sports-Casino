namespace intranet.services {
    export class UserService {
        /* @ngInject */
        constructor(private baseService: common.services.BaseService) {
        }

        public getCaptcha(): ng.IHttpPromise<any> {
            return this.baseService.get('authenticate/captcha');
        }

        public searchUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/search', data);
        }

        public saveWebAdminUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/addwebadmin', data);
        }
        public updateWebAdmin(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatewebadmin', data);
        }
        public changeWebsite(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/changewebsite', data);
        }

        public addAdminUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/addadminuser', data);
        }
        public getAdminUsers(): ng.IHttpPromise<any> {
            return this.baseService.get('user/getadminusers');
        }
        public updateAdminUser(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updateadminuser', data);
        }
        public updateAdminUserPermission(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updateadminuserpermission', data);
        }



        public changePassword(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/changepassword', data);
        }
        public changePasswordById(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/changepasswordbyid', data);
        }
        public resetPasswordByOtp(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/resetpassword', data);
        }
        public updateMobileNo(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatemobileno', data);
        }
        public register(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/register', data);
        }

        public updateMember(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatemember', data);
        }

        public changeUserLanguage(languageid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/changelanguage/' + languageid);
        }



        public addDownlineMembers(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/addmember', data);
        }

        public getUserById(memberid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getuserbyid/' + memberid);
        }

        public getBetfairConfig(memberid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getbetfairconfig/' + memberid);
        }

        public getParentsByUserId(memberid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getparents/' + memberid);
        }

        public getAllChildMembers(userid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getmembers/' + userid);
        }

        public changeStatus(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/changestatus', data);
        }
        public changePT(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/changept', data);
        }

        public requestOTP(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/requestotp', data);
        }
        public confirmOTP(otp: any, id: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/confirmotp/' + otp + '/' + id);
        }
        public changeMobileNo(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatemobileno', data);
        }

        public findMembers(searchquery: any, userid: any = '-1'): ng.IHttpPromise<any> {
            return this.baseService.get('user/findmembers/' + searchquery + '/' + userid);
        }

        // new methods

        public setFullCommission(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/setfullcommission', data);
        }

        public setCommission(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/setcommission', data);
        }

        public updateBetConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatebetconfig', data, { timeout: this.baseService.longTime });
        }

        public updateBTConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatebetfairconfig', data);
        }

        public updateOperator(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updateoperator', data);
        }

        public updatePtConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updateptconfig', data);
        }

        public getMyInfo(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getmyinfo/' + id);
        }

        public updateStakeConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatestakeconfig', data);
        }

        public getDownlinePt(userid: any, searchid: any = 0): ng.IHttpPromise<any> {
            if (searchid > 0) {
                return this.baseService.get('user/getdownlinept/' + userid + '/' + searchid);
            }
            else {
                return this.baseService.get('user/getdownlinept/' + userid);
            }
        }

        public checkUsername(username: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/checkusername/' + username);
        }
        public checkName(name: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/checkname/' + name);
        }

        public changeBettingLock(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/changebettinglock', data);
        }

        public getUsercode(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getusercode/' + id);
        }

        public changePTstatus(status: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/changeptstatus/' + status);
        }

        public changeOBDstatus(status: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/changeobd/' + status);
        }

        public firstLoginDone(): ng.IHttpPromise<any> {
            return this.baseService.get('user/firstlogindone');
        }

        public getSMSConfig(userid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getsmsconfig/' + userid);
        }

        public updateSMSConfig(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatesmsconfig', data);
        }

        public setChatRestoreId(restoreid: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/setchatrestoreid/' + restoreid);
        }


        public generateLInk(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('userreferral/generatelink', data);
        }

        public getReferenceLink(userid: any = ''): ng.IHttpPromise<any> {
            return this.baseService.get('userreferral/getlink/' + userid);
        }

        public getMyBetConfig(id: any = ''): ng.IHttpPromise<any> {
            return this.baseService.get('user/getbetconfig/' + id);
        }

        public validateRegisterOffer(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/validateregisteroffer', data, { timeout: this.baseService.reportTime });
        }

        public updateReferralSetting(data: any): ng.IHttpPromise<any> {
            return this.baseService.post('user/updatereferralsetting', data);
        }

        public getReferralSetting(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getreferralsetting/' + id);
        }

        public getMyReferral(): ng.IHttpPromise<any> {
            return this.baseService.get('user/getmyreferral');
        }

        public getMyReferralMember(id: any): ng.IHttpPromise<any> {
            return this.baseService.get('user/getmyreferralmember/' + id);
        }
    }

    angular.module('intranet.services').service('userService', UserService);

}