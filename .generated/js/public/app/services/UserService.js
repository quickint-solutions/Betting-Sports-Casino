var intranet;
(function (intranet) {
    var services;
    (function (services) {
        class UserService {
            constructor(baseService) {
                this.baseService = baseService;
            }
            getCaptcha() {
                return this.baseService.get('authenticate/captcha');
            }
            searchUser(data) {
                return this.baseService.post('user/search', data);
            }
            saveWebAdminUser(data) {
                return this.baseService.post('user/addwebadmin', data);
            }
            updateWebAdmin(data) {
                return this.baseService.post('user/updatewebadmin', data);
            }
            changeWebsite(data) {
                return this.baseService.post('user/changewebsite', data);
            }
            addAdminUser(data) {
                return this.baseService.post('user/addadminuser', data);
            }
            getAdminUsers() {
                return this.baseService.get('user/getadminusers');
            }
            updateAdminUser(data) {
                return this.baseService.post('user/updateadminuser', data);
            }
            updateAdminUserPermission(data) {
                return this.baseService.post('user/updateadminuserpermission', data);
            }
            changePassword(data) {
                return this.baseService.post('user/changepassword', data);
            }
            changePasswordById(data) {
                return this.baseService.post('user/changepasswordbyid', data);
            }
            resetPasswordByOtp(data) {
                return this.baseService.post('user/resetpassword', data);
            }
            updateMobileNo(data) {
                return this.baseService.post('user/updatemobileno', data);
            }
            register(data) {
                return this.baseService.post('user/register', data);
            }
            updateMember(data) {
                return this.baseService.post('user/updatemember', data);
            }
            changeUserLanguage(languageid) {
                return this.baseService.get('user/changelanguage/' + languageid);
            }
            addDownlineMembers(data) {
                return this.baseService.post('user/addmember', data);
            }
            getUserById(memberid) {
                return this.baseService.get('user/getuserbyid/' + memberid);
            }
            getBetfairConfig(memberid) {
                return this.baseService.get('user/getbetfairconfig/' + memberid);
            }
            getParentsByUserId(memberid) {
                return this.baseService.get('user/getparents/' + memberid);
            }
            getAllChildMembers(userid) {
                return this.baseService.get('user/getmembers/' + userid);
            }
            changeStatus(data) {
                return this.baseService.post('user/changestatus', data);
            }
            changePT(data) {
                return this.baseService.post('user/changept', data);
            }
            requestOTP(data) {
                return this.baseService.post('user/requestotp', data);
            }
            confirmOTP(otp, id) {
                return this.baseService.get('user/confirmotp/' + otp + '/' + id);
            }
            changeMobileNo(data) {
                return this.baseService.post('user/updatemobileno', data);
            }
            findMembers(searchquery, userid = '-1') {
                return this.baseService.get('user/findmembers/' + searchquery + '/' + userid);
            }
            setFullCommission(data) {
                return this.baseService.post('user/setfullcommission', data);
            }
            setCommission(data) {
                return this.baseService.post('user/setcommission', data);
            }
            updateBetConfig(data) {
                return this.baseService.post('user/updatebetconfig', data, { timeout: this.baseService.longTime });
            }
            updateBTConfig(data) {
                return this.baseService.post('user/updatebetfairconfig', data);
            }
            updateOperator(data) {
                return this.baseService.post('user/updateoperator', data);
            }
            updatePtConfig(data) {
                return this.baseService.post('user/updateptconfig', data);
            }
            getMyInfo(id) {
                return this.baseService.get('user/getmyinfo/' + id);
            }
            updateStakeConfig(data) {
                return this.baseService.post('user/updatestakeconfig', data);
            }
            getDownlinePt(userid, searchid = 0) {
                if (searchid > 0) {
                    return this.baseService.get('user/getdownlinept/' + userid + '/' + searchid);
                }
                else {
                    return this.baseService.get('user/getdownlinept/' + userid);
                }
            }
            checkUsername(username) {
                return this.baseService.get('user/checkusername/' + username);
            }
            checkName(name) {
                return this.baseService.get('user/checkname/' + name);
            }
            changeBettingLock(data) {
                return this.baseService.post('user/changebettinglock', data);
            }
            getUsercode(id) {
                return this.baseService.get('user/getusercode/' + id);
            }
            changePTstatus(status) {
                return this.baseService.get('user/changeptstatus/' + status);
            }
            changeOBDstatus(status) {
                return this.baseService.get('user/changeobd/' + status);
            }
            firstLoginDone() {
                return this.baseService.get('user/firstlogindone');
            }
            getSMSConfig(userid) {
                return this.baseService.get('user/getsmsconfig/' + userid);
            }
            updateSMSConfig(data) {
                return this.baseService.post('user/updatesmsconfig', data);
            }
            setChatRestoreId(restoreid) {
                return this.baseService.get('user/setchatrestoreid/' + restoreid);
            }
            generateLInk(data) {
                return this.baseService.post('userreferral/generatelink', data);
            }
            getReferenceLink(userid = '') {
                return this.baseService.get('userreferral/getlink/' + userid);
            }
            getMyBetConfig(id = '') {
                return this.baseService.get('user/getbetconfig/' + id);
            }
            validateRegisterOffer(data) {
                return this.baseService.post('user/validateregisteroffer', data, { timeout: this.baseService.reportTime });
            }
            updateReferralSetting(data) {
                return this.baseService.post('user/updatereferralsetting', data);
            }
            getReferralSetting(id) {
                return this.baseService.get('user/getreferralsetting/' + id);
            }
            getMyReferral() {
                return this.baseService.get('user/getmyreferral');
            }
            getMyReferralMember(id) {
                return this.baseService.get('user/getmyreferralmember/' + id);
            }
        }
        services.UserService = UserService;
        angular.module('intranet.services').service('userService', UserService);
    })(services = intranet.services || (intranet.services = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=UserService.js.map