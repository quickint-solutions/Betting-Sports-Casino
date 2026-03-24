var intranet;
(function (intranet) {
    var common;
    (function (common) {
        var helpers;
        (function (helpers) {
            class ApkPackages {
                constructor() {
                    this.pk = [];
                }
                getFunPackages() {
                    this.pk.splice(0);
                    this.pk.push({ name: 'Funbook Client', pk: 'com.knots.funbookclient', key: 'AAAA2tbCh58:APA91bFlhLM1zyJZ9kcpEq79BwuzrP8sG2YRnEWI0kl6LUbYI8ETV4VMQwd5Q_O8SZRrZ20mCp0ragsBPrl7bDnOfPupYiqDId8y0HDzcQYI2cbw_rbIKitTz_ShoLT7A2lfvy9a-om0fYJRMVmG4NHjBTVpcfmljQ' });
                    this.pk.push({ name: 'Funbook Master', pk: 'com.knots.funbookexch', key: 'AAAAqGcPcQ8:APA91bGO3uLnpk0qU9_5UgnJn5pwSjzWEed9oLgP49apOEE05znWMjcGasYVwdySOtXLhfxucLexttxmyL6gikJubbFk3kqucRetbJ0S0dn2Mqx8ydFRPXOtEY8usJaLvYDJS2aXi-Haw3IQkBkF-G1XeTBdWxJvmw' });
                    this.pk.push({ name: 'Sports Client', pk: 'com.knots.sports999client', key: 'AAAAjlodjZo:APA91bFCRzklHkOLGcfB1JhtKOR68jNCJa9o0TuGXp4oXVF53mcgbaRZquAmRVfvoo1H_Zm8atXJSKP7Udvjk6e1TFOAEIs6rUeNfLihHl1_43OT5l9LHtEk3MGJRS7SJWomE4SQmFWsuiVijksREhZCXTKpQGUylg' });
                    this.pk.push({ name: 'Sports Master', pk: 'com.knots.sports999master', key: 'AAAAUPiZuq4:APA91bE0Nq2JxMQ-6BHNdasqDvcQ_V80fBidzxnwy28mPYHb93NI4oWtjoSS1kRUqmzc5grJMUpGfaoYD3zlP6qYsX5J6g7gN-kQouIOxJuxS3K2fakpoUAz6aT4pGbZrqMaT2ZfKKZsb4VaVBDFUZ89IdYGdd70rA' });
                    this.pk.push({ name: 'Jannat Client', pk: 'com.knots.jannatclient', key: 'AAAA4KhnHiU:APA91bEgrLwA7Mm8kw7pYZTin6D1vuY_hd5avZIJrwiSXy-Mecm_NrqbXkB77gyNZup8uVs0s_3RqJKSn0IGlDm9iHUdg2J4q3NuJvlDSwMDhBAShPDdz1I0hocfPnrSPf5bxHxQ3nO6sDz1-q1Uo2XmUwKABsj-fQ' });
                    this.pk.push({ name: 'Jannat Master', pk: 'com.knots.jannatmaster', key: 'AAAAfhlL3r8:APA91bFCPqCWtHX-DMnVK7jTtlCsDOGVRuJZNe5yzqlsORMOphzVUZsom9Qpb7WLbjWH7JjE5L6mEzrnrskGpoip5eRkvyddemtN6e2bYwbHXYSXDPtOOJsF2dtJlcRfbiOk49qR_yUOhHFwDHEqFxx-YAI_XQ-Q0g' });
                    this.pk.push({ name: 'Dexch Client', pk: 'com.knots.client_dexch', key: 'AAAAIAjjcKQ:APA91bHKv1HBjZHgkNKhk4x0mnET_1t_UEqmj08r_iD5Q1FBZcosGF213DmzEy5KeVRhJlWFTxCb50YLMQ_a-mOhpV1ZC8E6-8s693euVRXS95_6gCo2e_1vTgGl7GT28_P0QGgbKtjTcPojEVSXC2jjg0MUzbsP1A' });
                    this.pk.push({ name: 'Dexch Master', pk: 'com.knots.master_dexch', key: 'AAAAjKcLmP8:APA91bHr4-uImHcM2DyWkqmZ-H7xqLmtwz_H6ZblDBmkbDYyFMCDo1YumHPzdBCI8Apl_98y7In5Ryx01jPMB0_HiBcwzxXqGzTgfCAsmHOfwXLt7CuoihM6QWEM9qQWBYP5MzOVD4RJiZr45fAu4C53oIGyFbA6aw' });
                    this.pk.push({ name: 'Win Exchange Client', pk: 'com.knots.client_winexch', key: 'AAAAvo5Iol4:APA91bE8DttyCq8q1R9FPp49jgij8xp28vJ6rik4Zed6q-5G8fkzfMqpMBcX7CWTy1XsaMyJXv0JHy9Mp7vNMvf-iOs8B-m1UZfuPpQqYPdzh7-9K0U4roZI_cbjZN2TNK2y2CnVc1pA' });
                    this.pk.push({ name: 'Win Exchange Master', pk: 'com.knots.master_winexch', key: 'AAAAhP_WknI:APA91bEoqa3BWj5nXTyi5nS_0grQDolKckMJ1Eq2xkzCsQPHPO5oioiUo4brxdVWbxQjBtUp_dXSVsAzWM8riwOr5KXdgqAJpebQCHrBWTON3OTkFZ_gpv0bwSHgR07DLNBwC2Ni7Or1' });
                    this.pk.push({ name: 'Goaline Client', pk: 'com.knots.client_goa_line', key: 'AAAAlZUic7M:APA91bGAy1Gh3e_8TYnyRxXQrGUVmT2vbYqdATSnSFV72EGhTY4oi4iP2GYwyYf9bwuLj7sM-5_S08h80OzrtByl6KCaJ5B5cD_peJhkMVopGiCAf1b2GpEEAm1SZb-3dwt2F4wLAKaP' });
                    this.pk.push({ name: 'Goaline Master', pk: 'com.knots.master_goa_line', key: 'AAAAu8D5nss:APA91bEhdd5iwM6-sWMTpxkUP9fh_Ik6QfIkcIsUdUP5D5ovLukvRoUjyEMPWVFozZ-am15kLnTba6dmD7i6FkHAvAhE-9lKOO9ra8Q3_q_5_LdXpvKHw9F1_aTY1CV5Vmv61hnwuIpF' });
                    return this.pk;
                }
                getMarutiPackages() {
                    this.pk.splice(0);
                    this.pk.push({ pk: 'com.knots.maruticlient', name: 'Maruti Client', key: 'AAAAl6aAyrI:APA91bHoxM-FHm7y9CzTVfuKgq2ZFBzI4N7uIWZIEuBdGwpX9YJ18f4KMrpH9tGloR7_m7g0Uwfokx0RLhZ_3RHCuuEnsEO6-KDY0PtQQ-edTp-UwR5mF7adq7bkf25jXsHtppFepWjE' });
                    this.pk.push({ pk: 'com.knots.marutimaster', name: 'Maruti Master', key: 'AAAATDI4nMs:APA91bGXeLuL1DHKTPTDdM1KGJCFbkBb11amvHB0G73plW4gwOHqIGRhiaNjqukLrR858B5cZtoulw1nxHpM2hZ9c9eJL5tAdhoMzweGYF3wmFHUUv5IpVcmISxf0mZTEWc59Hl5Dek0' });
                    this.pk.push({ pk: 'com.knots.client_7starexch', name: '7Star Client', key: 'AAAAlqdImuA:APA91bFrISs1eNnowhQfIFzAtuma7sh-6cZb9XsE4Rp5CVqPS3HZy8mE_rzkOS9-7-H0za9x69eOVh-EJ3jsySPCm0p24CwbRqTqRbINhOLCo4VYIVNuD6ZfSmr0XFQGlPIAQejL_bGs' });
                    this.pk.push({ pk: 'com.knots.master_7starexch', name: '7Star Master', key: 'AAAABN9HREo:APA91bHLjteHKMViIr_DxmD5MExd6MLIU26lxu7d_8d9e699tLJToRLmjtL23pgARmqqvpBt2-l8jZRmqoLk1pubOQp-kU6bRPRmQ0U91o0XyvMx8DUS-ePbfd-s-kA9qsAce5sC_P42' });
                    this.pk.push({ pk: 'com.knots.angelexchclient', name: 'Angel Client', key: 'AAAA3cxz3CY:APA91bGPz-OEOQ3qg5wJIuOPUAOTtotT54-ZoH_SVyP8oVTwNH5FsrThHaLvSwI3H3VVeUGZajQfj3QvCe91E7-ViQdHA7yumdbwiWpiXPm0mbc7M7aXgTtkQyhFdcR0g6x2e3nC63bl' });
                    this.pk.push({ pk: 'com.knots.angelexchmaster', name: 'Angel Master', key: 'AAAAdnGv4BI:APA91bHmmSMQYuwUGQ6jmuljiVXHtElF6EqIz48a4meNInFQSKdJxMY-bbVFl-40h2gl-B-inEZUk_qOjND_ZgkyhO_LjjA4GpO9xDCSgdiFKdm3ZgWbFWDpQsGhvaT-e_yO4aKfGWkV' });
                    this.pk.push({ pk: 'com.knots.applexchclient', name: 'Apple Client', key: 'AAAAt8bJTkQ:APA91bG6wQ6R5ZRDxWLocYZEV5-zBWKPwApbgKp4giCqxfKmp8LakXCtEM9uq6KLBZYulkYIR4gmUTCHc9W_DlfOxglDxRzN5Af7qu6Nnqg4_vl5PqJGBIztBOjwstfnjgrkUUtFkJIO' });
                    this.pk.push({ pk: 'com.knots.applexchmaster', name: 'Apple Master', key: 'AAAAylBT39U:APA91bEo2PasRsHPtURd-oyLKJJ8RoeDSNUiCZPbUZ8SFace5uuVs3lsY0stCcs58GPeJ78rK9HDNfdtdcfPW8neKx6zLHR-yDSwheeHFG9Nd3yclSexEz04_XlBH5LCoI-BX50TMjDx' });
                    this.pk.push({ pk: 'com.knots.babaexchclient', name: 'Baba Client', key: 'AAAA0k_mhsw:APA91bHl1lF2YiuVXf-PVMbPNAUOHHrMVk3nS5MJ9gKM9rfW2oL7egq4Rsfx1FuA2vnamlAJ1NmODDd6XycjEVRkGUUUvsLZ8NPUv24ZumrLOMN_M3x7nd7DftiWZmWzEk3TWy7_un0y' });
                    this.pk.push({ pk: 'com.knots.babaexchmaster', name: 'Baba Master', key: 'AAAAhg_rQmo:APA91bFnV1cFnw0hcfCSppfCnvsmsRRB7MHPR2i91Jp5OmfAb3p4BWXqOZsvl3i1bYVmPY9kfOdtD6GdoMjS7MOb5eeaq1G6-BoNHkIbCHtuUmI25LUxle7SNJ3UgqrgsF2ps-W_fcE3' });
                    this.pk.push({ pk: 'com.knots.client_matrixexch', name: 'Matrix Client', key: 'AAAAX1OK47g:APA91bFVaI_IGwUnF_L3_zWVp4FlewpeFk4DLz_YXEdlGTn5TA9exxqem-6zhVqRmSR1s-lHEWKyG9jXtP17xFa3HF9wHqI9lbuW1ZL2KVXsKu4MFokwr2yj9mvYa40yPJ5vnYNI3Bn1' });
                    this.pk.push({ pk: 'com.knots.matrixexchmaster', name: 'Matrix Master', key: 'AAAAjDBuhRc:APA91bEd0nFiV2CiOKuFVA2ZZB9GkJpSqJ-TNncGts0Fu7qb2Ab-ja5UDV4Lf9ZW_0FxBS0A6euNTN9GwOGay2GJKPUjIiLTbsRSRVB3eppdKqPJuSy3q7asvKxM7B-sKcT2Cq76Iaut' });
                    this.pk.push({ pk: 'com.knots.rolexexchclient', name: 'Rolex Client', key: 'AAAAZvqRsy0:APA91bEEIaY3dOKN6DWgICbbvSNpzrGC7XbG0bbzjQX7JOayUlUXZKOzLVCTDFYQlOO50Pv1eKj0ny4RJBW7X2bRzm2L589IsHfnnZqI9_2jwHJK8fsr1P2pu8rfltVanvEeF01xNu59' });
                    this.pk.push({ pk: 'com.knots.rolexexchmaster', name: 'Rolex Master', key: 'AAAAA844btY:APA91bEA40IWD-W3wChPdatbucGxz9LFzT1PPzgAWKfgntucSzs0lln8K4rh6SW36vqo5qRP5JFz3ROeNCh5SLTwBVqad5jWGFhySXeMV1sDPB2m1c6i0X6YZZB2UdT5jFMUtWHI18AZ' });
                    this.pk.push({ pk: 'com.knots.royalexchclient', name: 'Royal Client', key: 'AAAA8dq210A:APA91bH_xvutHec1cxLlLKOKxneIP0tM6DGSWA1XPZ7S-LXS7sHyp6_7y1IDJzbfwFveFOFFOGuMpKzpCbM4kkPvOJYDeI4r2dI-NRYufzyPQt07Cx_bcs3CpgIrSEcKZ8kBayy6fDg1' });
                    this.pk.push({ pk: 'com.knots.royalexchmaster', name: 'Royal Master', key: 'AAAAUKxwpFU:APA91bG8sx1SOrGqyWIh_IBkhPNvtLGVLVmD7QvRjC2gDUhZJxZD9eoQ5jEr-4AfJSIvc1i52UW02JDPh0dtMe8nUIYuKEYNmF9LL5_QlmKooizWYK1sKc2p3sxQSHo9WMGTXoVbZWgP' });
                    return this.pk;
                }
            }
            class ApkHelper {
                static getFunPackages() {
                    return new ApkPackages().getFunPackages();
                }
                static getMarutiPackages() {
                    return new ApkPackages().getMarutiPackages();
                }
            }
            helpers.ApkHelper = ApkHelper;
        })(helpers = common.helpers || (common.helpers = {}));
    })(common = intranet.common || (intranet.common = {}));
})(intranet || (intranet = {}));
//# sourceMappingURL=ApkHelper.js.map