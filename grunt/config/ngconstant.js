module.exports = {
    options: {
        dest: '<%= config.generatedJs %>/common/settings.js',
        space: '  ',
        name: 'intranet.config',
        constants: {
            settings: {
                ThemeName: '<%= config.theme %>',
                TokenStorageKey: 'refer-token',
                AuthTokenStorageKey: 'auth-refer-token',
                ServerTokenName: 'token',
                ServerAuthTokenName: 'primary-token',
                ClaimsStorageKey: 'claims',
                StakeConfig: 'stake_range',
                OneClickConfig: 'instantbet',
                MultiMarketPin: 'multimarkets',
                SportTreeHeader: 'sporttreeheader',
                UserData: 'userdata',
                CricketId: '5ead73fb7846303b7e7e7638',
                SoccerId: '5ead73fb7846303b7e7e7635',
                TennisId: '5ead73fb7846303b7e7e7636',
                HorseRacingId: '5ead73fb7846303b7e7e763c',
                GreyhoundId: '5ead73fb7846303b7e7e7650',
                SoccerBfId: 1,
                TennisBfId: 2,
                CricketBfId: 4,
                LiveGamesId: '5ead73fb7846303b7e7e7658',
                VirtualGameId: '5f7d5f0b5996cf359cbf53a1',
                BinaryId: '5ead73fb7846303b7e7e763f',
                DeviceType: 'resolution',
                CSRFKey: 'Content-Decoding',
                BookMarketPin: 'bookpin',
                ShownOneClickWarning: 'oneclickwarning',
                CurrencyRate: 1,
                CurrencyCode: 'GLC',
                CurrencyFraction: 2,
                VertexUser: 'vertex_user',
                HasAPK: true,
                IsBetfairLabel: false,
                IsFaaS: false,
                FaasAccessLevel: 1,
                IsCRDRFaas: false,
                WSUrl: "wss://f9364b7d39f4.marutiexch.com/ws",
                WSFTUrl: "wss://89ef9939.maruti.site/ftws",
                IsLMTAvailable: false,
                PublishName: "change_me",
                Maintenance_Obj: "webApi",
                IdleTime: 1800,
                WebSiteIdealFor: 1, // 1=both, 2=client, 3=master
                StorageMode: 1,
                FairXIFrameUrl: 'https://www.casino.thefaircasino.games/#/',
                // FairX Casino game-list endpoint. GET returns { success, data: [{ id, name, gameTables: [...] }] }.
                // Requires three headers: `token` (session, from fdService.launchFairDeal),
                // `operator` (tenant Mongo ID — NOT the numeric operatorId from fdService),
                // and `primary-token` (pre-shared tenant client token). Configure the
                // latter two here; the session token is supplied at call time.
                FairXGameListUrl: 'https://f67867bd606e.thefaircasino.games/gametable/getgameinfo',
                FairXOperatorId: '63cfbb55040828cb17f60f4b',
                FairXPrimaryToken: 'b52179f2-9544-4ec0-bdce-ba000ebe72a2',
                IsMobileSeperate: false,
                MobileUrl: ''
            }
        }
    },
    local: {
        constants: {
            settings: {
                ApiBaseUrl:'https://090fb07bdff3.book365.com/',
                // ApiBaseUrl: 'https://3da24e98.bazigar.io/',
                Title: 'Fairbet',
                ImagePath: '/public/',
                APKPath: 'apk/bookpro',
                WebApp: 'drpapaya',
                ThemeColor: '#efae10',
                //IsFaaS: true,
                //IsBetfairLabel: true,
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                //WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                FairXIFrameUrl: 'https://crimson-cake-a35e.cricfeed10.workers.dev/#/',
                //FairXIFrameUrl: 'https://casino.fairxstudio.com/#/',
                //FairXIFrameUrl: 'http://localhost:9009/public/#/',
                FairXGameListUrl: 'https://f67867bd606e.thefaircasino.games/gametable/getgameinfo',
                FairXOperatorId: '63cfbb55040828cb17f60f4b',
                FairXPrimaryToken: 'b52179f2-9544-4ec0-bdce-ba000ebe72a2',
                Maintenance_Obj: 'webApi_m',
                WebSiteIdealFor: 1,

            }
        }
    },

    deploy_uk_maruti: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://f9364b7d39f4.marutiexch.com/',
                Title: 'fairbook',
                ImagePath: '../',
                APKPath: 'apk/auexch',
                WebApp: 'auexch',
                ThemeColor: '#d3ba52',
                Maintenance_Obj: 'webApi_m',
                //IsLMTAvailable:true,
                PublishName: "WebApp_Fairbok_Site",
                FairXIFrameUrl: 'https://casino.fairxstudio.com/#/',
            }
        }
    },
    deploy_new_ui: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://f768dafd155e.drpapaya.ai/',
                // ApiBaseUrl: 'https://3da24e98.bazigar.io/',
                Title: 'Fairbet',
                ImagePath: '../',
                APKPath: 'apk/bookpro',
                WebApp: 'drpapaya',
                ThemeColor: '#efae10',
                //IsFaaS: true,
                //IsBetfairLabel: true,
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                //WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                FairXIFrameUrl: 'https://crimson-cake-a35e.cricfeed10.workers.dev/#/',
                //FairXIFrameUrl: 'https://casino.fairxstudio.com/#/',
                //FairXIFrameUrl: 'http://localhost:9009/public/#/',
                Maintenance_Obj: 'webApi_m',
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_one247_io: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://29abc00c5a14.one247.io/',
                Title: 'ONE247 Exchange',
                ImagePath: '../',
                APKPath: 'apk/one247',
                WebApp: 'one247',
                ThemeColor: '#383c09',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "one247.io",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_one247_bet: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://0e3935705dac.one247.bet/',
                Title: 'ONE247 Exchange',
                ImagePath: '../',
                APKPath: 'apk/one247bet',
                WebApp: 'one247bet',
                ThemeColor: '#e67d00',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "one247.bet",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_king247: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://84a2c00cab14.king247.co/',
                Title: 'King247 Exchange',
                ImagePath: '../',
                APKPath: 'apk/king247',
                WebApp: 'king247',
                ThemeColor: '#173c85',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "king247.co",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_drpapaya: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://f768dafd155e.drpapaya.in/',
                Title: 'Dr.Papaya',
                ImagePath: '../',
                APKPath: 'apk/drpapaya',
                WebApp: 'drpapaya',
                ThemeColor: '#1f2f7a',
                WSUrl: "wss://ws1bde3a2661.one247.bet/ws",
                PublishName: "drpapaya.in",
                WebSiteIdealFor: 2,
            }
        }
    },
    deploy_drpapaya_admin: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://f768dafd155e.drpapaya.in/',
                Title: 'Dr.Papaya',
                ImagePath: '../admin/',
                APKPath: 'apk/drpapaya_admin',
                WebApp: 'drpapaya_admin',
                ThemeColor: '#0f1f27',
                WSUrl: "wss://ws1bde3a2661.one247.bet/ws",
                PublishName: "admin.drpapaya.in",
                WebSiteIdealFor: 3,
            }
        }
    },
    deploy_thekingbook: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://f4efaa4b145c.thekingbook.com/',
                Title: 'The King Book',
                ImagePath: '../',
                APKPath: 'apk/thekingbook',
                WebApp: 'thekingbook',
                ThemeColor: '#ff7828',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "thekingbook.com",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_drpapayaio: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://f768dafd155e.drpapaya.io/',
                Title: 'Dr.Papaya',
                ImagePath: '../',
                APKPath: 'apk/drpapayaio',
                WebApp: 'drpapayaio',
                ThemeColor: '#0f1f27',
                WSUrl: "wss://ws1bde3a2661.one247.bet/ws",
                PublishName: "drpapaya.io",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_minister777: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://b764dafa155a.minister777.com/',
                Title: 'Minister777',
                ImagePath: '../',
                APKPath: 'apk/minister777',
                WebApp: 'minister777',
                ThemeColor: '#6717a8',
                WSUrl: "wss://ws1bde3a2661.one247.bet/ws",
                PublishName: "minister777.com",
                WebSiteIdealFor: 2,
            }
        }
    },
    deploy_minister777_admin: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://b764dafa155a.minister777.com/',
                Title: 'Minister777',
                ImagePath: '../admin/',
                APKPath: 'apk/minister777_admin',
                WebApp: 'minister777_admin',
                ThemeColor: '#7c4ad3',
                WSUrl: "wss://ws1bde3a2661.one247.bet/ws",
                PublishName: "admin.minister777.com",
                WebSiteIdealFor: 3,
            }
        }
    },
    deploy_win555: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://d768waad125s.win555.in/',
                Title: 'Win555',
                ImagePath: '../',
                APKPath: 'apk/win555',
                WebApp: 'win555',
                ThemeColor: '#d5a818',
                WSUrl: "wss://ws1bde3a2661.one247.bet/ws",
                PublishName: "win555.in",
                WebSiteIdealFor: 1,
            }
        }
    },


    deploy_fairbook: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://5043ee2d3639.fairbook.io/',
                Title: 'Fairbook Exchange',
                ImagePath: '../',
                APKPath: 'apk/fairbook',
                WebApp: 'fairbook',
                ThemeColor: '#ffb80c',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "fairbook.io",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_bookpro: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://9196c03c76d0.bookpro.in/',
                Title: 'Bookpro Exchange',
                ImagePath: '../',
                APKPath: 'apk/bookpro',
                WebApp: 'bookpro',
                ThemeColor: '#484912',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "bookpro.in",
                WebSiteIdealFor: 1,
            }
        }
    },

    deploy_royalexch: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://b59e8407a9ff.royalexch.games/',
                Title: 'Royal Online Games',
                ImagePath: '../',
                APKPath: 'apk/royalexch',
                WebApp: 'royalexch',
                ThemeColor: '#cfb24b',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "royalexch.games",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_bazigarbet: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://f8601430.bazigar.bet/',
                Title: 'Bazigar Exchange',
                ImagePath: '../',
                APKPath: 'apk/bazigar',
                WebApp: 'bazigar',
                ThemeColor: '#111111',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "bazigar.bet",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_jaibook: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://a40f5ddf8feb.jaibook.site/',
                Title: 'JaiBook',
                ImagePath: '../',
                APKPath: 'apk/jaibook',
                WebApp: 'jaibook',
                ThemeColor: '#da605f',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "jaibook.site",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_jackpot247: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://a40f5ddf8feb.jackpot247.games/',
                Title: 'Jackpot 247',
                ImagePath: '../',
                APKPath: 'apk/jackpot247',
                WebApp: 'jackpot247',
                ThemeColor: '#b43c60',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "jackpot247.games",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_winjoy365: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://1a8c0rc8553f.winjoy365.live/',
                Title: 'Winjoy365',
                ImagePath: '../',
                APKPath: 'apk/winjoy365',
                WebApp: 'winjoy365',
                ThemeColor: '#1e8067',
                WSUrl: "wss://wsd14e6f02b915.khelking.club/ws",
                PublishName: "winjoy365.live",
                WebSiteIdealFor: 1,
            }
        }
    },

    deploy_lucky77: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://5031d5ad46c5.lucky77.in/',
                Title: 'Lucky77',
                ImagePath: '../',
                APKPath: 'apk/lucky77',
                WebApp: 'lucky77',
                ThemeColor: '#ffb80c',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "lucky77.in",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_wicket777: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://63c8ba96e160.10wicket777.in/',
                Title: '10Wicket 777',
                ImagePath: '../',
                APKPath: 'apk/wicket777',
                WebApp: 'wicket777',
                ThemeColor: '#23292e',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "10wicket777.in",
                WebSiteIdealFor: 2,
            }
        }
    },
    deploy_wicket777_admin: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://63c8ba96e160.10wicket777.in/',
                Title: '10Wicket 777',
                ImagePath: '../admin/',
                APKPath: 'apk/wicket777_admin',
                WebApp: 'wicket777_admin',
                ThemeColor: '#23292e',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "admin.10wicket777.in",
                WebSiteIdealFor: 3,
            }
        }
    },

    deploy_book365: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://090fb07bdff3.book365.com/',
                Title: 'Book365',
                ImagePath: '../',
                APKPath: 'apk/book365',
                WebApp: 'book365',
                ThemeColor: '#169c59',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "book365.com",
                WebSiteIdealFor: 2,
            }
        }
    },
    deploy_book365_admin: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://090fb07bdff3.book365.com/',
                Title: 'Book365',
                ImagePath: '../admin/',
                APKPath: 'apk/book365_admin',
                WebApp: 'book365_admin',
                ThemeColor: '#169c59',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "admin.book365.com",
                WebSiteIdealFor: 3,
            }
        }
    },
    deploy_rockybook24: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://0fe6d4ef3515.rockybook24.com/',
                Title: 'Rocky Book 24',
                ImagePath: '../',
                APKPath: 'apk/rockybook24',
                WebApp: 'rockybook24',
                ThemeColor: '#6ebdd9',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "rockybook24.com",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_betinexchange99: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://69fe21c5ddee.betinexchange99.com/',
                Title: 'Betinexchange99',
                ImagePath: '../',
                APKPath: 'apk/betinexchange99',
                WebApp: 'betinexchange99',
                ThemeColor: '#383c09',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "betinexchange99.com",
                WebSiteIdealFor: 1,
            }
        }
    },

    deploy_bsafe999: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://29abc00c5a14.bsafe999.com/',
                Title: 'BSAFE999 Exchange',
                ImagePath: '../',
                APKPath: 'apk/bsafe999',
                WebApp: 'bsafe999',
                ThemeColor: '#ffb80c',
                WSUrl: "wss://ws1bde3a1550.one247.io/ws",
                PublishName: "bsafe999.com",
                WebSiteIdealFor: 1,
            }
        }
    },

    // bazigar....
    deploy_bazigar: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://3da24e98.bazigar.io/',
                Title: 'Bazigar Exchange',
                ImagePath: '../',
                APKPath: 'apk/lotusbook',
                WebApp: 'bazigar',
                ThemeColor: '#111111',
                WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                PublishName: "bazigar.io",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_lotusbook9: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://52a6fae3.lotusbook9.co/',
                Title: 'Lotusbook',
                ImagePath: '../',
                APKPath: 'apk/lotusbook',
                WebApp: 'lotusbook',
                ThemeColor: '#09363c',
                WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                PublishName: "lotusbook9.co",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_lotusbook7: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://c2da2d63.lotusbook7.art/',
                Title: 'Lotusbook',
                ImagePath: '../',
                APKPath: 'apk/lotusbook',
                WebApp: 'lotusbook',
                ThemeColor: '#09363c',
                WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                PublishName: "lotusbook7.art",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_lotusbook9io: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://52a6fae3.lotusbook9.io/',
                Title: 'Lotusbook',
                ImagePath: '../',
                APKPath: 'apk/lotusbook',
                WebApp: 'lotusbook',
                ThemeColor: '#09363c',
                WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                PublishName: "lotusbook9.io",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_exch444: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://8cb06f43.exch444.co/',
                Title: 'Exch444',
                ImagePath: '../',
                APKPath: 'apk/exch444',
                WebApp: 'exch444',
                ThemeColor: '#000000',
                WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                PublishName: "exch444.co",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_rock7: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://668a05f3fe32.rock7.art/',
                Title: 'Rock7',
                ImagePath: '../',
                APKPath: 'apk/rock7',
                WebApp: 'rock7',
                ThemeColor: '#ffb80c',
                WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                PublishName: "rock7.art",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_exch333: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://495732d4.exch333.co/',
                Title: 'Exch333',
                ImagePath: '../',
                APKPath: 'apk/exch333',
                WebApp: 'exch333',
                ThemeColor: '#000000',
                WSUrl: "wss://b59bb5ce8147.bazigar.io/ws",
                PublishName: "exch333.co",
                WebSiteIdealFor: 1,
            }
        }
    },



    deploy_lucky7: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://c848d057c221.lucky7.games/',
                Title: 'Lucky7',
                ImagePath: '../',
                APKPath: 'apk/lucky7',
                WebApp: 'lucky7',
                ThemeColor: '#ffb80c',
                WSUrl: 'wss://ws1aa0ec16.lucky7.games/ws',
                PublishName: "lucky7.games",
                WebSiteIdealFor: 1,
            }
        }
    },
    deploy_abexch9: {
        constants: {
            settings: {
                ApiBaseUrl: 'https://c952652cad5.abex9.com/',
                Title: 'ABexch',
                ImagePath: '../',
                APKPath: 'apk/abexch9',
                WebApp: 'abexch9',
                ThemeColor: '#42adab',
                WSUrl: 'wss://ws1aa0ec16.lucky7.games/ws',
                PublishName: "abex9.com",
                WebSiteIdealFor: 1,
            }
        }
    },

}