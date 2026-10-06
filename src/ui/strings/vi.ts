import type { StringKey } from './en';

/**
 * Vietnamese for every string in `en.ts`, key for key. It also gives the Vietnamese names of
 * places whose English name the catalogue carries (`name` + the id in CamelCase, see names.ts).
 * A translation says what the English says and adds no fact of its own.
 */
export const vi: Readonly<Record<StringKey, string>> & Readonly<Record<string, string>> = {
  appTitle: 'Khám Phá Vũ Trụ',
  wholeView: 'Xem toàn cảnh',
  cardSolarSystemHello:
    'Đây là hệ Mặt Trời của chúng ta: một ngôi sao là Mặt Trời, và tám hành tinh quay quanh. Chạm vào hành tinh hay tên nó để bay tới.',
  cardSolarSystemFact1: 'Hệ Mặt Trời của chúng ta hình thành khoảng 4,6 tỉ năm trước.',
  cardSolarSystemFact2: 'Hành tinh ở gần Mặt Trời chạy quanh nó rất nhanh. Sao Thủy là nhanh nhất.',
  cardSolarSystemFact3:
    'Hành tinh ở xa Mặt Trời đi rất lâu. Sao Hải Vương cần 165 năm Trái Đất cho một vòng.',
  cardSunHello:
    'Mặt Trời là một ngôi sao: một quả cầu khí nóng, phát sáng ở giữa hệ Mặt Trời của chúng ta.',
  cardSunFact1: 'Khoảng 1,3 triệu Trái Đất có thể nằm vừa bên trong Mặt Trời.',
  cardSunFact2:
    'Phần Mặt Trời mà ta nhìn thấy nóng khoảng 5.500 °C. Sâu trong lõi, nó nóng khoảng 15 triệu °C.',
  cardSunFact3:
    'Mặt Trời không quay như một quả cầu đặc. Phần giữa quay nhanh hơn phần trên và phần dưới.',
  cardMercuryHello: 'Sao Thủy là hành tinh nhỏ nhất và gần Mặt Trời nhất.',
  cardMercuryFact1:
    'Sao Thủy là hành tinh nhanh nhất. Nó chạy một vòng quanh Mặt Trời chỉ trong 88 ngày Trái Đất.',
  cardMercuryFact2: 'Nó phủ đầy hố va chạm, rất giống Mặt Trăng của chúng ta.',
  cardMercuryFact3:
    'Sao Thủy không có lớp không khí giữ nhiệt, nên ban đêm có thể lạnh tới -180 °C.',
  cardVenusHello:
    'Sao Kim là hành tinh nóng nhất. Lớp không khí dày của nó giữ nhiệt như một tấm chăn.',
  cardVenusFact1: 'Trên Sao Kim nóng khoảng 467 °C, đủ để làm chảy chì.',
  cardVenusFact2: 'Sao Kim quay ngược. Ở đó, Mặt Trời mọc ở hướng tây.',
  cardVenusFact3: 'Sau Mặt Trời và Mặt Trăng, Sao Kim là thứ sáng nhất trên bầu trời của chúng ta.',
  cardEarthHello: 'Trái Đất là nhà của chúng ta. Đây là nơi duy nhất mà ta biết là có sự sống.',
  cardEarthFact1: 'Phần lớn Trái Đất được nước bao phủ.',
  cardEarthFact2: 'Trái Đất nghiêng, và độ nghiêng đó tạo ra các mùa.',
  cardEarthFact3:
    'Trái Đất là hành tinh duy nhất có tên tiếng Anh không lấy từ một câu chuyện cổ Hy Lạp hay La Mã.',
  cardMoonHello: 'Mặt Trăng quay quanh Trái Đất khoảng 27 ngày một vòng.',
  cardMoonFact1:
    'Chúng ta luôn thấy cùng một mặt của Mặt Trăng. Từ Trái Đất không bao giờ thấy được mặt bên kia.',
  cardMoonFact2:
    'Dưới ánh nắng, Mặt Trăng nóng tới khoảng 127 °C. Trong bóng tối, nó lạnh tới khoảng -173 °C.',
  cardMoonFact3: 'Mặt Trăng đang từ từ trôi xa Trái Đất, mỗi năm khoảng một inch (2,5 cm).',
  cardMarsHello: 'Sao Hỏa là Hành tinh Đỏ. Sắt gỉ trong đất làm nó trông có màu đỏ.',
  cardMarsFact1: 'Sao Hỏa có ngọn núi lửa lớn nhất hệ Mặt Trời. Nó tên là Olympus Mons.',
  cardMarsFact2: 'Sao Hỏa là hành tinh duy nhất mà chúng ta đã gửi xe tự hành tới chạy khắp nơi.',
  cardMarsFact3: 'Sao Hỏa có hai mặt trăng nhỏ, tên là Phobos và Deimos.',
  cardJupiterHello: 'Sao Mộc là hành tinh lớn nhất trong hệ Mặt Trời của chúng ta.',
  cardJupiterFact1:
    'Nếu Sao Mộc là một cái vỏ rỗng, khoảng 1.000 Trái Đất có thể nằm vừa bên trong.',
  cardJupiterFact2:
    'Vết Đỏ Lớn là một cơn bão khổng lồ, lớn hơn cả Trái Đất. Nó đã thổi suốt hàng trăm năm.',
  cardJupiterFact3:
    'Sao Mộc có ngày ngắn nhất trong các hành tinh. Nó quay hết một vòng trong khoảng 10 giờ.',
  cardSaturnHello: 'Sao Thổ là hành tinh lớn thứ hai, một quả cầu khổng lồ phần lớn là khí.',
  cardSaturnFact1:
    'Các mảnh trong vành đai Sao Thổ có đủ cỡ, từ hạt băng tí hon đến tảng to bằng ngôi nhà.',
  cardSaturnFact2:
    'So với kích thước của mình, Sao Thổ nhẹ đến mức có thể nổi trong bồn tắm, nếu có cái bồn đủ lớn.',
  cardSaturnFact3: 'Sao Thổ có nhiều mặt trăng hơn hẳn mọi hành tinh khác.',
  cardUranusHello: 'Sao Thiên Vương quay nằm nghiêng, đi quanh Mặt Trời như một quả bóng đang lăn.',
  cardUranusFact1: 'Sao Thiên Vương rất lạnh. Không khí của nó có thể lạnh tới khoảng -224 °C.',
  cardUranusFact2: 'Màu xanh lam pha lục của nó là do một loại khí tên là mê-tan.',
  cardUranusFact3: 'Sao Thiên Vương có 13 vành đai mờ.',
  cardNeptuneHello: 'Sao Hải Vương là hành tinh xa Mặt Trời nhất. Nó tối, lạnh và rất nhiều gió.',
  cardNeptuneFact1:
    'Sao Hải Vương là hành tinh nhiều gió nhất. Gió ở đó thổi hơn 2.000 km một giờ.',
  cardNeptuneFact2:
    'Sao Hải Vương là hành tinh đầu tiên được tìm ra bằng cách làm toán, chứ không phải nhìn thấy trên trời.',
  cardNeptuneFact3:
    'Sao Hải Vương mới đi quanh Mặt Trời đúng một vòng kể từ khi được tìm ra năm 1846.',
  names: 'Tên',
  zoomIn: 'Phóng to',
  zoomOut: 'Thu nhỏ',
  back: 'Quay lại',
  viewControls: 'Di chuyển góc nhìn',
  grownUps: 'Dành cho người lớn',
  grownUpsClose: 'Đóng',
  grownUpsPrivacyTitle: 'Quyền riêng tư',
  grownUpsPrivacy1:
    'Khám Phá Vũ Trụ không có quảng cáo, không có tài khoản và không theo dõi. Ứng dụng không thu thập hay gửi đi bất kỳ thông tin nào về người đang dùng.',
  grownUpsKeptTitle: 'Những gì được lưu trong trình duyệt này',
  grownUpsKept:
    'Ba ghi chú nhỏ được lưu trong trình duyệt này và không bao giờ rời khỏi thiết bị: rằng lời chào hướng dẫn đã được xem, những nơi nào đã được mở (để đánh dấu), và ngôn ngữ đã chọn. Không ghi chú nào cho biết ai đang dùng ứng dụng.',
  grownUpsClear: 'Xóa tiến trình',
  grownUpsCleared: 'Đã xóa tiến trình.',
  visitedMark: 'Bạn đã đến đây rồi',
  grownUpsPrivacy2:
    'Khi chạy, ứng dụng không tải gì từ trang web khác: hình ảnh, phông chữ và dữ liệu đều đi kèm ứng dụng.',
  grownUpsPrivacy3:
    'Tính năng đọc to chỉ có ở bản tiếng Anh. Nó phát các bản ghi âm đi kèm ứng dụng, được tạo sẵn bằng giọng máy tính (Kokoro, giọng af_heart); không có gì được gửi đi đâu để ứng dụng nói. Nếu thiếu bản ghi, giọng đọc có sẵn trên thiết bị sẽ được dùng, không bao giờ dùng giọng phải nói qua máy chủ.',
  grownUpsAccuracyTitle: 'Chính xác đến mức nào?',
  grownUpsAccuracy1:
    'Mọi kích thước, khoảng cách và quỹ đạo đều lấy từ các trang liệt kê bên dưới, và mỗi câu trên thẻ đều dựa vào một đoạn trích từ một trang của NASA. Bản tiếng Việt được dịch từ bản tiếng Anh.',
  grownUpsAccuracy2:
    'Vị trí các hành tinh đúng đến một phần nhỏ của một độ trong khoảng từ năm {from} đến năm {to}. Các mặt trăng được vẽ trên quỹ đạo đơn giản hóa: phần lớn lệch trong vài độ, Mặt Trăng của Trái Đất lệch trong khoảng ba độ, còn Mimas có thể nằm xa vị trí thật trên quỹ đạo của nó. Nhật thực và nguyệt thực không được thể hiện.',
  grownUpsAccuracy3:
    'Chỉ chế độ tên là Thật mới giữ đúng cả kích thước lẫn khoảng cách. Hai chế độ kia kéo mọi thứ lại gần để dễ nhìn, và có ghi rõ trên màn hình.',
  grownUpsPicturesTitle: 'Hình ảnh lấy từ đâu',
  grownUpsSourcesTitle: 'Con số và thông tin lấy từ đâu',
  grownUpsLinksNotice: 'Các liên kết này mở trang web khác.',
  compare: 'So sánh',
  compareClose: 'Đóng phần so sánh',
  compareSizes: 'To cỡ nào?',
  compareDistances: 'Xa cỡ nào?',
  compareSizesLead: 'Các hành tinh đứng cạnh nhau, đúng kích thước thật so với nhau.',
  compareSunNote: 'Mặt Trời không có ở đây: nó rộng gấp {times} lần {planet} nên không vẽ vừa.',
  compareDistancesLead:
    'Các hành tinh xếp trên một đường thẳng, đúng khoảng cách thật tới Mặt Trời. Trượt ngang để xem hết.',
  compareDistancesNote:
    'Ở đây chỉ có khoảng cách là thật. Với tỉ lệ này, ngay cả Sao Mộc cũng nhỏ hơn một chấm rất nhiều.',
  places: 'Những nơi để khám phá',
  groupControl: 'Các loại nơi chốn',
  groupPlanets: 'Hành tinh',
  groupDwarfPlanets: 'Hành tinh lùn',
  groupSpaceRocks: 'Đá vũ trụ',
  groupStars: 'Ngôi sao',
  groupStarPictures: 'Hình sao',
  groupGalaxies: 'Thiên hà',
  groupSpaceWonders: 'Kỳ quan vũ trụ',
  rowItsMoons: 'các mặt trăng của nó:',
  rowAroundIt: 'quay quanh nó:',
  rowBackTo: 'Quay lại {group}',
  visitedCount: '{seen}/{all}',
  fitView: 'Thu hết vào tầm nhìn',
  closeCard: 'Đóng thẻ',
  readToMe: 'Đọc cho em nghe',
  peekHint: 'Chạm để đọc về',
  firstHint: 'Chạm vào một hành tinh để bay tới đó',
  menu: 'Trình đơn',
  stopReading: 'Dừng đọc',
  coolFacts: 'Điều thú vị',
  moreFacts: 'Xem thêm',
  stepNext: 'Tiếp theo: {name}',
  stepPrevious: 'Trước đó: {name}',
  aboutTheGlobe: 'Về quả cầu này',
  nameSolarSystem: 'Hệ Mặt Trời của chúng ta',
  nameSun: 'Mặt Trời',
  nameMoon: 'Mặt Trăng',
  eyebrowSolarSystem: 'Chào mừng nhà thám hiểm vũ trụ',
  eyebrowStar: 'Ngôi sao · ở giữa hệ Mặt Trời của chúng ta',
  eyebrowPlanet: 'Hành tinh · thứ {place} tính từ Mặt Trời',
  eyebrowMoon: 'Mặt trăng · quay quanh {parent}',
  eyebrowDwarfPlanet: 'Hành tinh lùn · quay quanh Mặt Trời',
  helloDwarfPlanet: '{name} là một hành tinh lùn.',
  cardAsteroidBeltHello:
    'Vành đai tiểu hành tinh là một vòng rộng gồm các tảng đá vũ trụ nằm giữa Sao Hỏa và Sao Mộc.',
  cardAsteroidBeltFact1:
    'Tiểu hành tinh là những mảnh đá còn sót lại từ khi hệ Mặt Trời hình thành.',
  cardAsteroidBeltFact2: 'Tiểu hành tinh lớn nhất là Vesta. Nó rộng khoảng 530 km.',
  cardAsteroidBeltFact3:
    'Phần lớn tiểu hành tinh sần sùi chứ không tròn, và nhiều cái phủ đầy hố va chạm.',
  cardKuiperBeltHello:
    'Vành đai Kuiper là một vòng khổng lồ hình bánh vòng gồm các thế giới băng giá, ở xa bên ngoài Sao Hải Vương.',
  cardKuiperBeltFact1:
    'Nó bắt đầu từ quỹ đạo Sao Hải Vương, xa Mặt Trời gấp khoảng 30 lần so với Trái Đất.',
  cardKuiperBeltFact2: 'Các nhà khoa học cho rằng nó chứa hàng triệu vật thể nhỏ bằng băng.',
  cardKuiperBeltFact3: 'Một số thế giới ở đó, như Sao Diêm Vương, rộng hơn 1.000 km.',
  cardHalleyHello: 'Sao chổi Halley là một khối băng, khí đóng băng và bụi quay quanh Mặt Trời.',
  cardHalleyFact1:
    'Khi sao chổi đến gần Mặt Trời, nó ấm lên và mọc ra một đám mây bao quanh, gọi là đầu sao chổi.',
  cardHalleyFact2:
    'Ánh nắng và gió từ Mặt Trời thổi bụi và khí ra khỏi sao chổi, tạo thành một cái đuôi dài và sáng.',
  cardHalleyFact3: 'Sao chổi Halley không bao giờ đến gần Mặt Trời hơn 89 triệu km.',
  nameHalley: 'Sao chổi Halley',
  eyebrowComet: 'Sao chổi · quay quanh Mặt Trời',
  cometNote:
    'Quầng sáng và hai cái đuôi là hình vẽ, không phải ảnh chụp. Chúng chỉ đúng hướng của đuôi thật, nhưng kích thước không đúng tỉ lệ. Đường đi được vẽ đúng cho các năm 1950 đến 2050; những lần ghé trước đó đến vào thời điểm hơi khác.',
  statClosest: 'Gần Mặt Trời nhất',
  valueTimesEarthOne: '{n} lần khoảng cách của Trái Đất',
  conceptStarTitle: 'Ngôi sao là gì?',
  conceptStarText:
    'Ngôi sao là một quả cầu khí khổng lồ, nóng và phát sáng. Mặt Trời là ngôi sao gần chúng ta nhất.',
  conceptPlanetTitle: 'Hành tinh là gì?',
  conceptPlanetText:
    'Hành tinh là một thế giới lớn, tròn, quay quanh một ngôi sao và đã dọn sạch những vật lớn khác khỏi đường đi của mình.',
  conceptDwarfPlanetTitle: 'Hành tinh lùn là gì?',
  conceptDwarfPlanetText:
    'Hành tinh lùn quay quanh Mặt Trời và gần tròn, nhưng nó đi chung đường với những vật khác.',
  conceptMoonTitle: 'Mặt trăng là gì?',
  conceptMoonText: 'Mặt trăng là một thế giới tự nhiên quay quanh một hành tinh.',
  conceptSpacecraftTitle: 'Vệ tinh là gì?',
  conceptSpacecraftText:
    'Vệ tinh là bất cứ thứ gì quay quanh một thứ lớn hơn. Mặt Trăng là một vệ tinh. Con người cũng chế tạo vệ tinh và đưa chúng lên vũ trụ.',
  conceptAsteroidTitle: 'Tiểu hành tinh là gì?',
  conceptAsteroidText: 'Tiểu hành tinh là một mảnh đá còn sót lại từ khi hệ Mặt Trời hình thành.',
  conceptCometTitle: 'Sao chổi là gì?',
  conceptCometText:
    'Sao chổi là một khối băng còn sót lại từ khi hệ Mặt Trời còn mới. Đến gần Mặt Trời, nó mọc ra một cái đuôi.',
  conceptBeltTitle: 'Vành đai là gì?',
  conceptBeltText:
    'Vành đai là một vòng rộng gồm rất nhiều thế giới nhỏ, tất cả đều quay quanh Mặt Trời.',
  pictureAltPleiades:
    'Một đám mây bụi xám mỏng manh được chiếu sáng bởi một ngôi sao sáng của cụm Tua Rua, nằm ngay ngoài bức ảnh.',
  namePleiades: 'Cụm sao Tua Rua',
  cardPleiadesHello: 'Tua Rua là một nhóm sao sáng mà bạn có thể thấy không cần kính thiên văn.',
  cardPleiadesFact1: 'Nó có hơn một nghìn ngôi sao, được lực hấp dẫn giữ lỏng lẻo bên nhau.',
  cardPleiadesFact2: 'Người ta còn gọi nó là Bảy Chị Em.',
  cardPleiadesFact3:
    'Nó ở cách ta khoảng 445 năm ánh sáng, nhưng các nhà khoa học chưa thống nhất về con số đó.',
  pictureAltOrionNebula:
    'Một đám mây khí và bụi khổng lồ phát sáng màu hồng, cam và xanh lam, bên trong có những ngôi sao trẻ sáng rực.',
  nameOrionNebula: 'Tinh vân Lạp Hộ',
  cardOrionNebulaHello:
    'Tinh vân Lạp Hộ là một đám mây khí và bụi khổng lồ, nơi các ngôi sao mới đang được tạo ra.',
  cardOrionNebulaFact1: 'Bạn có thể thấy nó không cần kính thiên văn vào một đêm tối trời.',
  cardOrionNebulaFact2: 'Đây là đám mây lớn tạo sao gần Trái Đất nhất.',
  cardOrionNebulaFact3: 'Bốn ngôi sao trẻ, lớn ở giữa tạo nên hình dáng của đám mây.',
  pictureAltCrabNebula:
    'Một đám mây rối gồm các sợi khí màu cam và xanh lam, do một ngôi sao phát nổ để lại.',
  nameCrabNebula: 'Tinh vân Con Cua',
  cardCrabNebulaHello: 'Tinh vân Con Cua là những gì còn lại của một ngôi sao đã phát nổ.',
  cardCrabNebulaFact1:
    'Người ở Trung Quốc đã thấy vụ nổ vào năm 1054. Nó sáng đến mức thấy được cả ban ngày.',
  cardCrabNebulaFact2: 'Đám mây rộng khoảng sáu năm ánh sáng.',
  cardCrabNebulaFact3: 'Ở giữa nó là lõi bị nén chặt của ngôi sao, đang quay rất nhanh.',
  pictureAltAndromeda:
    'Một thiên hà xoắn ốc dài, nằm nghiêng, sáng rực hàng triệu ngôi sao, có những dải bụi tối uốn lượn bên trong.',
  nameAndromeda: 'Thiên hà Tiên Nữ',
  cardAndromedaHello:
    'Thiên hà Tiên Nữ là thiên hà lớn gần thiên hà của chúng ta, Dải Ngân Hà, nhất.',
  cardAndromedaFact1: 'Bạn có thể thấy nó bằng chính mắt mình vào một đêm tối trời.',
  cardAndromedaFact2:
    'Bức ảnh này cho thấy ánh sáng của 200 triệu ngôi sao, và đó mới chỉ là một phần.',
  cardAndromedaFact3: 'Bức ảnh được ghép từ hơn 600 tấm ảnh của Hubble. Việc đó mất hơn 10 năm.',
  pictureAltTriangulum:
    'Phần giữa của một thiên hà xoắn ốc: một quầng sáng cam dịu dày đặc sao, có những mảng xanh lam sáng nơi sao mới đang hình thành.',
  nameTriangulum: 'Thiên hà Tam Giác',
  cardTriangulumHello:
    'Thiên hà Tam Giác là một thiên hà xoắn ốc to bằng khoảng một nửa Dải Ngân Hà của chúng ta.',
  cardTriangulumFact1: 'Nó ở cách ta khoảng 3 triệu năm ánh sáng.',
  cardTriangulumFact2: 'Nó là thiên hà lớn thứ ba trong nhóm thiên hà của chúng ta.',
  cardTriangulumFact3:
    'Bức ảnh này chỉ cho thấy phần giữa của nó, với 25 triệu ngôi sao rõ từng ngôi.',
  pictureAltSombrero:
    'Một thiên hà nhìn từ cạnh bên: một khối phồng trắng sáng ở giữa, quanh nó là một vòng bụi tối mỏng, trông như chiếc mũ rộng vành.',
  nameSombrero: 'Thiên hà Mũ Rộng Vành',
  cardSombreroHello:
    'Thiên hà Mũ Rộng Vành là một thiên hà xoắn ốc mà ta nhìn gần như từ cạnh bên.',
  cardSombreroFact1: 'Nó ở cách ta 28 triệu năm ánh sáng.',
  cardSombreroFact2: 'Nó trông như một chiếc mũ rộng vành. Sombrero là tên một loại mũ của Mexico.',
  cardSombreroFact3: 'Các nhà khoa học cho rằng có một lỗ đen khổng lồ ở giữa nó.',
  pictureAltWhirlpool:
    'Một thiên hà xoắn ốc nhìn từ trên xuống, có hai cánh tay dài uốn cong lấm tấm màu hồng. Một thiên hà nhỏ hơn màu vàng nằm ở cuối một cánh tay.',
  nameWhirlpool: 'Thiên hà Xoáy Nước',
  cardWhirlpoolHello: 'Thiên hà Xoáy Nước là một thiên hà xoắn ốc có những cánh tay dài uốn cong.',
  cardWhirlpoolFact1: 'Nó ở cách ta 31 triệu năm ánh sáng.',
  cardWhirlpoolFact2: 'Các cánh tay của nó là nơi sao mới được tạo ra.',
  cardWhirlpoolFact3: 'Thiên hà nhỏ bên cạnh đã lướt ngang qua nó suốt hàng trăm triệu năm.',
  pictureAltM87:
    'Một thiên hà khổng lồ, tròn, phát sáng màu vàng, có một tia xanh lam mảnh phóng ra từ giữa.',
  nameM87: 'Thiên hà M87',
  cardM87Hello: 'M87 là một thiên hà khổng lồ có vài nghìn tỉ ngôi sao.',
  cardM87Fact1: 'Có một lỗ đen khổng lồ ở giữa nó.',
  cardM87Fact2: 'Dải Ngân Hà của chúng ta có vài trăm tỉ ngôi sao. M87 có nhiều hơn thế rất nhiều.',
  cardM87Fact3:
    'Vệt xanh lam trong ảnh là một tia gồm các hạt tí hon bay ra với tốc độ gần bằng tốc độ ánh sáng.',
  conceptNebulaTitle: 'Tinh vân là gì?',
  conceptNebulaText:
    'Tinh vân là một đám mây khí và bụi khổng lồ trong vũ trụ. Sao mới có thể ra đời bên trong nó.',
  conceptStarClusterTitle: 'Cụm sao là gì?',
  conceptStarClusterText: 'Cụm sao là một nhóm sao ở cùng nhau, được lực hấp dẫn giữ lại.',
  conceptGalaxyTitle: 'Thiên hà là gì?',
  conceptGalaxyText:
    'Thiên hà là một gia đình sao khổng lồ: hàng tỉ ngôi sao, tất cả được lực hấp dẫn giữ lại với nhau.',
  sceneControl: 'Khám phá ở đâu',
  sceneSolar: 'Hệ Mặt Trời',
  sceneDeep: 'Vũ trụ xa',
  eyebrowDeep: '{kind} · cách ta {distance}',
  kindNebula: 'Tinh vân',
  kindStarCluster: 'Cụm sao',
  kindGalaxy: 'Thiên hà',
  kindStar: 'Ngôi sao',
  kindBlackHole: 'Lỗ đen',
  kindExoplanet: 'Hành tinh của một ngôi sao khác',
  eyebrowHome: '{kind} · nhà của chúng ta',
  cardAntaresHello:
    'Antares là một ngôi sao đỏ khổng lồ ở trái tim của chòm Bọ Cạp, một hình sao trên trời.',
  cardAntaresFact1: 'Nó rộng gấp khoảng 700 lần Mặt Trời.',
  cardAntaresFact2: 'Nó là một sao siêu khổng lồ đỏ: một ngôi sao rất lớn, nguội, sắp hết đời.',
  cardAntaresFact3:
    'Khi được tạo ra năm 2017, đây là bức ảnh chi tiết nhất về một ngôi sao không phải Mặt Trời.',
  cardVyCanisMajorisHello:
    'VY Canis Majoris là một trong những ngôi sao lớn nhất mà con người biết đến.',
  cardVyCanisMajorisFact1:
    'Nó rộng gấp khoảng 1.400 lần Mặt Trời. Các nhà khoa học chưa chắc về kích thước chính xác.',
  cardVyCanisMajorisFact2: 'Nó ở cách ta khoảng 5.000 năm ánh sáng.',
  cardVyCanisMajorisFact3: 'Nó phun ra những đám mây khí và bụi khổng lồ.',
  pictureAltAntares: 'Một quả cầu cam mờ nhòe với những mảng sáng hơn và tối hơn, trên nền đen.',
  pictureAltVyCanisMajoris:
    'Một điểm sáng chói với đám mây rộng, mỏng manh bao quanh, có màu lục, vàng, hồng và tím.',
  cardRigelHello:
    'Rigel là một ngôi sao xanh lam rất sáng. Nó là bàn chân của Thợ Săn Orion, một hình sao trên trời.',
  cardRigelFact1: 'Nó rộng gấp khoảng 74 lần Mặt Trời.',
  cardRigelFact2:
    'Bề mặt của nó nóng hơn Betelgeuse màu đỏ hàng nghìn độ. Vì vậy nó tỏa sáng màu trắng xanh.',
  cardRigelFact3: 'Nó ở cách ta khoảng 860 năm ánh sáng.',
  cardSiriusHello:
    'Sirius là ngôi sao sáng nhất trên bầu trời đêm. Người ta gọi nó là sao Thiên Lang.',
  cardSiriusFact1: 'Nó rộng khoảng 2,4 triệu ki-lô-mét. Như thế là rộng hơn Mặt Trời.',
  cardSiriusFact2:
    'Bề mặt của nó khoảng 10.000 độ C, nóng hơn Mặt Trời. Nó tỏa sáng màu trắng xanh.',
  cardSiriusFact3:
    'Nó ở cách ta 8,6 năm ánh sáng. Đó là một trong những ngôi sao gần Trái Đất nhất.',
  cardSiriusBHello:
    'Sirius B là một ngôi sao tí hon, mờ, quay quanh sao Sirius sáng chói. Nó là một sao lùn trắng.',
  cardSiriusBFact1: 'Nó rộng khoảng 12.000 ki-lô-mét. Như thế là nhỏ hơn Trái Đất!',
  cardSiriusBFact2: 'Nó tí hon, nhưng chứa lượng vật chất gần bằng cả Mặt Trời.',
  cardSiriusBFact3:
    'Sao lùn trắng là phần còn lại khi một ngôi sao như Mặt Trời dùng hết nhiên liệu.',
  cardVegaHello:
    'Vega là ngôi sao sáng nhất trong chòm Thiên Cầm, Cây Đàn, một hình sao nhỏ trên trời.',
  cardVegaFact1: 'Nó rộng gần gấp ba lần Mặt Trời.',
  cardVegaFact2: 'Nó là một góc của Tam Giác Mùa Hè, nên là một trong những ngôi sao dễ tìm nhất.',
  cardVegaFact3: 'Khoảng 14.000 năm trước, Vega từng là sao Bắc Cực.',
  cardPolluxHello:
    'Pollux là ngôi sao sáng hơn trong hai ngôi sao làm đầu của hai anh em sinh đôi, chòm Song Tử.',
  cardPolluxFact1: 'Nó ở cách ta khoảng 34 năm ánh sáng.',
  cardPolluxFact2: 'Có một hành tinh quay quanh nó. Hành tinh ấy nặng hơn hai lần Sao Mộc.',
  cardPolluxFact3:
    'Muốn tìm nó, hãy kẻ một đường từ Rigel qua Betelgeuse rồi đi tiếp đến chòm Song Tử.',
  card51PegasiHello: '51 Pegasi là một ngôi sao rất giống Mặt Trời của chúng ta.',
  card51PegasiFact1:
    'Năm 1995, người ta tìm thấy một hành tinh quay quanh nó: hành tinh đầu tiên quanh một sao giống Mặt Trời.',
  card51PegasiFact2: 'Hành tinh ấy quay một vòng quanh ngôi sao chỉ trong bốn ngày.',
  card51PegasiFact3: 'Nó ở cách Trái Đất 51 năm ánh sáng.',
  cardAldebaranHello:
    'Aldebaran là một ngôi sao màu cam. Người ta coi nó là con mắt của chòm Kim Ngưu, con Bò.',
  cardAldebaranFact1: 'Nó là ngôi sao sáng nhất của chòm Kim Ngưu và sáng thứ 15 trên bầu trời.',
  cardAldebaranFact2: 'Nó ở cách ta 65 năm ánh sáng.',
  cardAldebaranFact3:
    'Trông nó như nằm trong một nhóm sao tên là Hyades, nhưng nhóm sao ấy ở xa hơn nhiều.',
  pictureAltSirius:
    'Một ngôi sao trắng xanh chói lòa với bốn tia sáng dài. Một chấm tí hon, Sirius B, nằm ở phía dưới bên trái.',
  pictureAltSiriusB:
    'Hình vẽ một quả cầu trắng phát sáng bên cạnh Trái Đất. Hai thứ to gần bằng nhau.',
  pictureAltVega:
    'Một quầng bụi rộng màu xanh lam quanh một mảng tròn tối ở giữa, nơi ánh sáng của ngôi sao đã được che đi.',
  pictureAlt51Pegasi: 'Một bầu trời tối đầy sao mờ, với một ngôi sao trắng sáng hơn ở giữa.',
  cardScorpiusHello: 'Bọ Cạp là một hình sao mà người ta thấy giống con bọ cạp có cái đuôi cong.',
  cardScorpiusFact1: 'Ngôi sao đỏ Antares được gọi là trái tim của con bọ cạp.',
  cardScorpiusFact2:
    'Một số dân tộc trên các đảo ở Thái Bình Dương thấy những ngôi sao này là một cái lưỡi câu khổng lồ.',
  cardScorpiusFact3: 'Vào một đêm trời quang, hãy thử dõi theo đường cong của cái đuôi.',
  cardLeoHello: 'Sư Tử là một hình sao mà người ta thấy giống con sư tử.',
  cardLeoFact1: 'Phần đầu của nó trông như một dấu hỏi viết ngược.',
  cardLeoFact2: 'Ngôi sao sáng Regulus là dấu chấm của dấu hỏi ấy.',
  cardLeoFact3: 'Dấu hỏi là đầu và bờm của sư tử. Một tam giác sao là phần thân sau của nó.',
  cardCygnusHello: 'Thiên Nga là một hình sao mà người ta thấy giống con thiên nga.',
  cardCygnusFact1:
    'Những ngôi sao sáng nhất của nó xếp thành chữ thập, nên còn được gọi là Bắc Thập Tự.',
  cardCygnusFact2: 'Ngôi sao sáng nhất của nó là Deneb. Tên ấy có nghĩa là cái đuôi.',
  cardCygnusFact3: 'Ngôi sao Albireo là cái mỏ của thiên nga. Nhìn qua kính thiên văn, nó rất đẹp.',
  cardGeminiTwinsHello:
    'Song Tử là một hình sao mà người ta thấy giống hai anh em sinh đôi. Hai ngôi sao sáng là hai cái đầu.',
  cardGeminiTwinsFact1: 'Hai cái đầu là hai ngôi sao Castor và Pollux. Pollux sáng hơn.',
  cardGeminiTwinsFact2: 'Castor trông như một ngôi sao, nhưng thật ra là sáu ngôi sao ở cùng nhau.',
  cardGeminiTwinsFact3: 'Muốn tìm hai anh em sinh đôi, hãy nhìn phía trên đầu của Orion.',
  cardLittleDipperHello: 'Bắc Đẩu Nhỏ là một hình sao. Nó thuộc một chòm sao tên là Gấu Nhỏ.',
  cardLittleDipperFact1:
    'Một ngôi sao của nó là Polaris, sao Bắc Cực. Nó nằm gần như ngay phía trên cực bắc của Trái Đất.',
  cardLittleDipperFact2: 'Ngày xưa, các thủy thủ dùng sao Bắc Cực để tìm đường.',
  cardLittleDipperFact3: 'Sao Bắc Cực thật ra là ba ngôi sao ở sát nhau.',
  nameLittleDipper: 'Chòm Bắc Đẩu Nhỏ',
  nameHerculesCluster: 'Cụm sao Vũ Tiên',
  cardHerculesClusterHello: 'Cụm sao Vũ Tiên là một quả cầu gồm hơn 100.000 ngôi sao.',
  cardHerculesClusterFact1: 'Nó ở cách Trái Đất 25.000 năm ánh sáng.',
  cardHerculesClusterFact2: 'Bạn có thể thấy nó bằng ống nhòm. Tháng 7 là lúc dễ thấy nhất.',
  cardHerculesClusterFact3:
    'Các ngôi sao của nó chen chúc đến mức đôi khi hai ngôi sao va vào nhau.',
  cardOmegaCentauriHello:
    'Omega Centauri là quả cầu sao lớn nhất và sáng nhất trong thiên hà của chúng ta.',
  cardOmegaCentauriFact1: 'Nó chứa khoảng 10 triệu ngôi sao.',
  cardOmegaCentauriFact2:
    'Nó ở cách ta khoảng 17.000 năm ánh sáng và rộng khoảng 450 năm ánh sáng.',
  cardOmegaCentauriFact3: 'Nó sáng đến mức bạn có thể thấy nó bằng mắt thường.',
  pictureAltHerculesCluster:
    'Một bầu trời đen chi chít hàng nghìn ngôi sao trắng, xanh và vàng, dày nhất ở giữa.',
  pictureAltOmegaCentauri:
    'Một quả cầu tròn khổng lồ gồm vô số ngôi sao li ti, dày đặc ở giữa và thưa dần ra phía rìa.',
  nameScorpius: 'Chòm Bọ Cạp',
  nameLeo: 'Chòm Sư Tử',
  nameCygnus: 'Chòm Thiên Nga',
  nameGeminiTwins: 'Chòm Song Tử',
  nameBodesGalaxy: 'Thiên hà Bode',
  nameCigarGalaxy: 'Thiên hà Điếu Xì Gà',
  nameAntennae: 'Thiên hà Râu',
  nameEagleNebula: 'Tinh vân Đại Bàng',
  nameRingNebula: 'Tinh vân Chiếc Nhẫn',
  nameHelixNebula: 'Tinh vân Xoắn Ốc',
  nameCarinaNebula: 'Tinh vân Thuyền Để',
  nameVeilNebula: 'Tinh vân Tấm Màn',
  cardBodesGalaxyHello: 'Thiên hà Bode là một trong những thiên hà sáng nhất trên bầu trời đêm.',
  cardBodesGalaxyFact1: 'Nó ở cách Trái Đất 11,6 triệu năm ánh sáng.',
  cardBodesGalaxyFact2: 'Có một lỗ đen nằm ở giữa nó. Lỗ đen ấy nặng bằng 70 triệu Mặt Trời.',
  cardBodesGalaxyFact3: 'Nhìn qua ống nhòm, nó trông như một vệt sáng mờ.',
  cardCigarGalaxyHello:
    'Thiên hà Điếu Xì Gà là một thiên hà mà ta nhìn từ bên cạnh, nên nó trông dài và mảnh.',
  cardCigarGalaxyFact1: 'Nó ở cách Trái Đất 12 triệu năm ánh sáng.',
  cardCigarGalaxyFact2:
    'Gần giữa nó, các ngôi sao mới ra đời nhanh gấp 10 lần so với cả thiên hà của chúng ta.',
  cardCigarGalaxyFact3: 'Sức hút của hàng xóm, Thiên hà Bode, khiến nó tạo ra nhiều sao đến vậy.',
  cardCentaurusAHello: 'Centaurus A là một thiên hà có một dải bụi tối vắt ngang qua giữa.',
  cardCentaurusAFact1: 'Có lẽ nó được tạo ra khi hai thiên hà va vào nhau.',
  cardCentaurusAFact2: 'Nó ở cách ta khoảng 11 triệu năm ánh sáng.',
  cardCentaurusAFact3: 'Một lỗ đen khổng lồ ở giữa nó đang từ từ nuốt khí và bụi.',
  cardAntennaeHello: 'Thiên hà Râu là hai thiên hà đang từ từ lao vào nhau.',
  cardAntennaeFact1: 'Chúng ở cách ta khoảng 65 triệu năm ánh sáng.',
  cardAntennaeFact2:
    'Những dải sao dài vươn ra từ chúng như râu của côn trùng. Tên của chúng là từ đó mà ra.',
  cardAntennaeFact3: 'Một ngày nào đó hai thiên hà sẽ nhập lại thành một thiên hà lớn.',
  cardEagleNebulaHello:
    'Tinh vân Đại Bàng là một đám mây khí và bụi, nơi những ngôi sao mới đang ra đời.',
  cardEagleNebulaFact1: 'Những cột khí và bụi cao này được gọi là Cột Trụ Sáng Tạo.',
  cardEagleNebulaFact2: 'Các cột cao chừng 4 đến 5 năm ánh sáng.',
  cardEagleNebulaFact3: 'Tinh vân này ở cách Trái Đất 7.000 năm ánh sáng.',
  cardRingNebulaHello:
    'Tinh vân Chiếc Nhẫn là một đám mây khí phát sáng trông giống một chiếc nhẫn.',
  cardRingNebulaFact1: 'Nó ở cách ta khoảng 2.000 năm ánh sáng, trong chòm Thiên Cầm, Cây Đàn.',
  cardRingNebulaFact2:
    'Khí màu xanh ở giữa thật ra có hình một quả bóng dài chĩa về phía chúng ta.',
  cardRingNebulaFact3: 'Bạn cần kính thiên văn để thấy chiếc nhẫn của nó.',
  cardHelixNebulaHello:
    'Tinh vân Xoắn Ốc là khí phát sáng quanh một ngôi sao sắp tắt, từng giống Mặt Trời.',
  cardHelixNebulaFact1:
    'Nó ở cách ta 650 năm ánh sáng, là một trong những tinh vân gần nhất thuộc loại này.',
  cardHelixNebulaFact2: 'Vòng sáng của nó rộng gần ba năm ánh sáng.',
  cardHelixNebulaFact3: 'Trên bầu trời, nó trông rộng gần bằng một nửa Mặt Trăng tròn.',
  cardCarinaNebulaHello:
    'Tinh vân Thuyền Để là một đám mây khí và bụi khổng lồ, nơi các ngôi sao ra đời.',
  cardCarinaNebulaFact1: 'Nó ở trong thiên hà của chúng ta, cách ta khoảng 7.500 năm ánh sáng.',
  cardCarinaNebulaFact2:
    'Nó rộng khoảng 300 năm ánh sáng, lớn đến mức các nhà khoa học phải nghiên cứu từng phần một.',
  cardCarinaNebulaFact3: 'Nó đủ sáng để bạn thấy bằng mắt thường.',
  cardVeilNebulaHello:
    'Tinh vân Tấm Màn là phần còn lại của một ngôi sao đã nổ tung vài nghìn năm trước.',
  cardVeilNebulaFact1: 'Nó ở cách ta khoảng 2.000 năm ánh sáng.',
  cardVeilNebulaFact2:
    'Nó rộng 110 năm ánh sáng. Trên bầu trời, nó che một vùng rộng gấp sáu lần Mặt Trăng tròn.',
  cardVeilNebulaFact3: 'Bức ảnh này chỉ cho thấy một phần nhỏ của nó.',
  pictureAltBodesGalaxy:
    'Một thiên hà xoắn ốc nhìn nghiêng: phần giữa vàng rực với những nhánh xanh mảnh cuộn quanh.',
  pictureAltCigarGalaxy:
    'Một thiên hà dài, mảnh, màu trắng xanh nhìn từ bên cạnh, với những đám mây đỏ phụt ra phía trên và phía dưới phần giữa.',
  pictureAltCentaurusA:
    'Cận cảnh một dải bụi nâu sẫm rộng với những mảng hồng, vắt ngang một quầng sao sáng nhạt.',
  pictureAltAntennae:
    'Hai thiên hà quấn vào nhau, màu cam ở giữa, với những vòng sao xanh, mây hồng và bụi tối ở giữa chúng.',
  pictureAltEagleNebula:
    'Ba cột khí và bụi cao, tối, đứng trước một quầng sáng xanh lục lam, có các ngôi sao xung quanh.',
  pictureAltRingNebula:
    'Một vòng khí bầu dục màu cam trên nền đen, bên trong xanh nhạt, ở giữa xanh thẫm.',
  pictureAltHelixNebula:
    'Một vòng khí lớn màu cam và đỏ trên nền đen, ở giữa màu xanh, trông như một con mắt.',
  pictureAltCarinaNebula:
    'Một cảnh rộng gồm những đám mây cuồn cuộn màu cam, nâu và xanh nhạt, với những nút tối và các ngôi sao sáng.',
  pictureAltVeilNebula:
    'Những dải khí mỏng, xoắn, phát sáng màu đỏ, xanh và vàng trên nền không gian đen.',
  nameCentaurusA: 'Thiên hà Centaurus A',
  pictureAltBetelgeuse:
    'Một quầng sáng tròn mờ nhòe trên nền đen: trắng vàng ở giữa, nhạt dần sang cam và đỏ sẫm ở rìa.',
  nameBetelgeuse: 'Betelgeuse',
  cardBetelgeuseHello:
    'Betelgeuse là một ngôi sao đỏ khổng lồ, một trong những ngôi sao lớn nhất từng được tìm thấy.',
  cardBetelgeuseFact1: 'Nó rộng gấp khoảng 700 lần Mặt Trời.',
  cardBetelgeuseFact2: 'Nó rất lớn và sáng, nhưng bề mặt của nó nguội hơn bề mặt Mặt Trời.',
  cardBetelgeuseFact3: 'Nó ở cách ta chừng 700 năm ánh sáng.',
  pictureAltProximaCentauri:
    'Một ngôi sao trắng sáng đứng một mình với bốn tia sáng, trên bầu trời đen lấm tấm những ngôi sao mờ hơn.',
  nameProximaCentauri: 'Proxima Centauri',
  cardProximaCentauriHello: 'Proxima Centauri là ngôi sao gần chúng ta nhất, không kể Mặt Trời.',
  cardProximaCentauriFact1: 'Nó ở cách ta hơn bốn năm ánh sáng một chút.',
  cardProximaCentauriFact2: 'Dù vậy, nó quá mờ để thấy được chỉ bằng mắt.',
  cardProximaCentauriFact3:
    'So với các ngôi sao thì nó nhỏ: chỉ nặng bằng khoảng một phần tám Mặt Trời.',
  pictureAltTrappist1:
    'Hình vẽ của họa sĩ về bảy hành tinh nhỏ xếp thành hàng, màu nâu, xám và xanh lam, bên cạnh một ngôi sao đỏ mờ.',
  nameTrappist1: 'Các hành tinh TRAPPIST-1',
  cardTrappist1Hello: 'TRAPPIST-1 là một ngôi sao có bảy hành tinh đá quay quanh.',
  cardTrappist1Fact1: 'Nó ở cách ta khoảng 40 năm ánh sáng.',
  cardTrappist1Fact2: 'Cả bảy hành tinh đều có thể có nước.',
  cardTrappist1Fact3:
    'Chưa ai nhìn thấy các hành tinh này ở gần. Bức hình là ý tưởng của họa sĩ về vẻ ngoài của chúng.',
  pictureAltMilkyWay:
    'Hình vẽ của họa sĩ về thiên hà của chúng ta nhìn từ trên xuống: một vòng xoắn các ngôi sao với một thanh sáng ở giữa, và một nhãn chỉ chỗ của Mặt Trời.',
  nameMilkyWay: 'Dải Ngân Hà',
  cardMilkyWayHello:
    'Dải Ngân Hà là thiên hà quê nhà của chúng ta. Mặt Trời là một trong những ngôi sao của nó.',
  cardMilkyWayFact1:
    'Nó là một vòng xoắn có hai cánh tay lớn quấn quanh một thanh gồm các ngôi sao ở giữa.',
  cardMilkyWayFact2:
    'Mặt Trời của chúng ta nằm cạnh một cánh tay nhỏ tên là Cánh tay Orion. Hãy tìm chữ Sun trong hình.',
  cardMilkyWayFact3:
    'Đây là hình vẽ của họa sĩ. Chúng ta sống bên trong Dải Ngân Hà nên không ai chụp được toàn bộ nó.',
  pictureAltSagittariusA: 'Một vòng sáng màu cam mờ nhòe với phần giữa tối, trên nền đen.',
  cardSagittariusAHello:
    'Sagittarius A* là lỗ đen khổng lồ ở giữa thiên hà của chính chúng ta, Dải Ngân Hà.',
  cardSagittariusAFact1: 'Nó nặng bằng bốn triệu Mặt Trời.',
  cardSagittariusAFact2: 'Nó ở cách ta khoảng 27.000 năm ánh sáng.',
  cardSagittariusAFact3: 'Nhìn từ Trái Đất, nó nhỏ như một chiếc bánh vòng đặt trên Mặt Trăng.',
  pictureAltGaiaBh1:
    'Một bản đồ toàn bộ Dải Ngân Hà dưới dạng một dải sáng vắt ngang một hình bầu dục tối, có hai dấu chỉ vị trí của hai lỗ đen.',
  cardGaiaBh1Hello: 'Gaia BH1 là lỗ đen gần Trái Đất nhất mà con người đã tìm thấy.',
  cardGaiaBh1Fact1: 'Nó ở cách ta 1.560 năm ánh sáng.',
  cardGaiaBh1Fact2: 'Nó nặng gấp khoảng mười lần Mặt Trời.',
  cardGaiaBh1Fact3:
    'Không ai nhìn thấy được nó. Người ta tìm ra nó vì ngôi sao quay quanh nó bị lắc lư.',
  pictureAltM87BlackHole: 'Một vòng sáng màu cam mờ nhòe quanh phần giữa tối, trên nền đen.',
  nameM87BlackHole: 'Lỗ đen M87',
  cardM87BlackHoleHello: 'Đây là bức ảnh đầu tiên từng chụp được về một lỗ đen.',
  cardM87BlackHoleFact1: 'Nó nằm ở giữa thiên hà M87, cách ta khoảng 55 triệu năm ánh sáng.',
  cardM87BlackHoleFact2: 'Quầng sáng là khí nóng xoáy quanh lỗ đen.',
  cardM87BlackHoleFact3: 'Ở giữa thiên hà của chúng ta cũng có một lỗ đen khổng lồ.',
  conceptBlackHoleTitle: 'Lỗ đen là gì?',
  conceptBlackHoleText:
    'Lỗ đen là nơi lực hấp dẫn kéo mạnh đến mức không gì thoát ra được, kể cả ánh sáng.',
  conceptExoplanetTitle: 'Ngoại hành tinh là gì?',
  conceptExoplanetText:
    'Ngoại hành tinh là một hành tinh quay quanh một ngôi sao khác, không phải Mặt Trời của chúng ta.',
  statHowFar: 'Cách ta bao xa',
  statLightLeft: 'Ánh sáng bạn thấy đã rời nó',
  statWide: 'Chiều rộng',
  valueLightYears: '{n} năm ánh sáng',
  valueMillionLightYears: '{n} triệu năm ánh sáng',
  valueYearsAgo: '{n} năm trước',
  valueMillionYearsAgo: '{n} triệu năm trước',
  pictureCredit: 'Ảnh: {credit}',
  realPicture: 'Bức ảnh thật. Chạm để phóng to hoặc thu nhỏ.',
  deepNotePictureCloud:
    'Đám mây 3D này được dựng từ bức ảnh thật ở góc màn hình. Độ sâu của đám mây chỉ là phỏng đoán: bức ảnh không cho ta biết điều đó.',
  deepNoteQuietBlackHole:
    'Lỗ đen này không phát ra ánh sáng nên không ai chụp ảnh được nó. Mô hình cho thấy một quả cầu tối che các ngôi sao phía sau. Các ngôi sao là tưởng tượng, và vòng xanh lam chỉ đánh dấu chỗ của quả cầu.',
  deepNoteSimulation:
    'Đây là mô hình máy tính về hình dáng mà người ta cho là của nó, không phải ảnh chụp. Bức ảnh thật ở góc màn hình.',
  deepNoteConstellation:
    'Mỗi ngôi sao được đặt đúng chỗ mà kính thiên văn vũ trụ Hipparcos đã đo. Bạn bắt đầu ở Mặt Trời, nơi các ngôi sao tạo thành hình này. Hãy xoay nó: thật ra các ngôi sao ở rất xa nhau. Các đường nối chỉ là cách người ta nối các chấm.',
  eyebrowConstellation: 'Hình sao · nhìn từ Trái Đất',
  helloConstellation: '{name} là một hình sao trên bầu trời đêm của chúng ta.',
  statNearestStar: 'Ngôi sao gần nhất',
  statFarthestStar: 'Ngôi sao xa nhất',
  valueStarAt: '{name}, {distance}',
  conceptConstellationTitle: 'Chòm sao là gì?',
  conceptConstellationText:
    'Chòm sao là một nhóm sao trông giống một hình trên bầu trời và có tên riêng. Các ngôi sao không thật sự ở cùng nhau: có ngôi gần ta, có ngôi ở rất xa.',
  cardOrionHello: 'Lạp Hộ là một hình sao mà người xưa nhìn thành một người thợ săn khổng lồ.',
  cardOrionFact1:
    'Để tìm nó, hãy tìm ba ngôi sao sáng nằm sát nhau thành một hàng. Đó là thắt lưng của người thợ săn.',
  cardOrionFact2: 'Hai ngôi sao sáng nhất của nó là Betelgeuse màu đỏ và Rigel màu xanh lam.',
  cardOrionFact3:
    'Ba ngôi sao thắt lưng trông như hàng xóm, nhưng chúng cách nhau hàng trăm năm ánh sáng.',
  cardBigDipperHello: 'Bắc Đẩu là một hình sao có dáng như chiếc muôi lớn để múc canh.',
  cardBigDipperFact1: 'Các ngôi sao của nó thuộc một chòm sao lớn hơn, chòm Gấu Lớn.',
  cardBigDipperFact2: 'Ở một số nước, người ta gọi nó là Cái Cày.',
  cardBigDipperFact3: 'Nó ở bầu trời phía bắc và rất dễ nhận ra.',
  cardSouthernCrossHello: 'Nam Thập Tự là một hình sao nổi tiếng gồm bốn ngôi sao sáng.',
  cardSouthernCrossFact1: 'Nó được nhìn rõ nhất từ nửa phía nam của Trái Đất.',
  cardSouthernCrossFact2: 'Nó có trên lá cờ của Úc và New Zealand.',
  cardSouthernCrossFact3: 'Một trong bốn ngôi sao của nó có màu cam.',
  cardCassiopeiaHello: 'Thiên Hậu là một hình sao có dáng như chữ W.',
  cardCassiopeiaFact1: 'Người xưa nhìn nó thành một nữ hoàng ngồi trên ngai.',
  cardCassiopeiaFact2: 'Từ nửa phía bắc của Trái Đất, bạn có thể thấy nó vào mọi đêm trời quang.',
  cardCassiopeiaFact3:
    'Ở phía bắc, nó lên cao nhất trên bầu trời vào các buổi tối mùa thu và mùa đông.',
  nameBigDipper: 'Chòm Bắc Đẩu',
  nameSouthernCross: 'Chòm Nam Thập Tự',
  deepNoteCluster:
    'Mỗi chấm là một ngôi sao thật, đặt đúng chỗ mà kính thiên văn vũ trụ Gaia đã đo. Khoảng cách tới các ngôi sao rất khó đo, nên cụm sao trông bị kéo dài về phía ta hơn so với thật.',
  deepNoteStarSizes:
    'Các ngôi sao có kích thước đúng so với nhau, và mỗi ngôi có màu do sức nóng của nó tạo ra. Các mảng trên sao khổng lồ là hình vẽ: chưa ai có ảnh rõ về chúng. Vòng xanh lam đánh dấu một ngôi sao quá nhỏ để thấy ở đây. Chúng được xếp cạnh nhau để so sánh: thật ra chúng cách nhau nhiều năm ánh sáng.',
  deepNotePlanetSystem:
    'Ngôi sao và đường đi của các hành tinh có kích thước đúng so với nhau, và các hành tinh quay với tốc độ thật. Các hành tinh được vẽ to gấp {times} lần để bạn nhìn thấy, và để trơn vì chưa ai thấy chúng trông ra sao.',
  eyebrowSpacecraft: 'Do con người chế tạo · quay quanh {parent}',
  spacecraftNote:
    'Đây là mô hình 3D do NASA làm, không phải ảnh chụp. Đường đi là đường thật của một ngày. Nó cứ dịch chuyển dần, nên vị trí trên đường đi hôm nay không hoàn toàn chính xác.',
  statFirstUsed: 'Dùng lần đầu',
  statHeight: 'Cao trên mặt đất',
  statNearest: 'Gần nhất, tính từ bề mặt',
  statFarthest: 'Xa nhất, tính từ bề mặt',
  valueMetresLong: 'dài {n} mét',
  statLength: 'Kích thước',
  cardIdaHello: 'Ida là một tiểu hành tinh có một mặt trăng tí hon của riêng mình, tên là Dactyl.',
  cardIdaFact1: 'Nó nằm trong vành đai chính, giữa Sao Hỏa và Sao Mộc.',
  cardIdaFact2: 'Tàu vũ trụ Galileo đã bay ngang qua nó năm 1993 trên đường tới Sao Mộc.',
  cardIdaFact3: 'Một tảng đá vũ trụ nhỏ rơi xuống và nằm lại trên mặt đất được gọi là thiên thạch.',
  cardPsycheHello: 'Psyche là một tiểu hành tinh lớn có một phần làm bằng kim loại.',
  cardPsycheFact1: 'Nó quay quanh Mặt Trời ở giữa Sao Hỏa và Sao Mộc.',
  cardPsycheFact2: 'Các nhà khoa học cho rằng nó là hỗn hợp của đá và kim loại.',
  cardPsycheFact3: 'Nó có thể chứa kim loại từ phần lõi của một thế giới nhỏ đã vỡ ra từ rất lâu.',
  cardJunoHello: 'Juno là một tàu vũ trụ được gửi đi để nghiên cứu Sao Mộc ở cự li gần.',
  cardJunoFact1: 'Nó là tàu vũ trụ đầu tiên ở Sao Mộc chạy bằng ánh nắng.',
  cardJunoFact2: 'Ba tấm pin mặt trời dài làm cho nó rộng hơn 20 mét.',
  cardJunoFact3: 'Vòng đầu tiên của nó quanh Sao Mộc mất 53 ngày.',
  modelAltJuno:
    'Mô hình 3D của Juno: một thân sáu cạnh với ba tấm pin mặt trời rất dài xòe ra như cánh cối xay gió.',
  nameMro: 'Tàu Mars Reconnaissance Orbiter',
  cardMroHello:
    'Tàu Mars Reconnaissance Orbiter quay quanh Sao Hỏa và chụp những bức ảnh rất nét về mặt đất.',
  cardMroFact1: 'Nó rời Trái Đất năm 2005.',
  cardMroFact2: 'Nó tìm dấu hiệu cho thấy Sao Hỏa từng có nước trong một thời gian dài.',
  cardMroFact3: 'Máy ảnh của nó có thể thấy một vật nhỏ cỡ cái bàn ăn trên mặt đất.',
  modelAltMro:
    'Mô hình 3D của tàu: một thân có chảo tròn lớn ở trên và một tấm pin mặt trời rộng ở mỗi bên.',
  nameSwift: 'Đài quan sát Swift',
  cardSwiftHello: 'Swift là một vệ tinh canh chừng những vụ nổ mạnh nhất trong vũ trụ.',
  cardSwiftFact1: 'Nó mang theo ba kính thiên văn.',
  cardSwiftFact2: 'Nó thấy được những loại ánh sáng mà mắt ta không thấy, như tia X và tia gamma.',
  cardSwiftFact3: 'Nó được phóng lên vào tháng 11 năm 2004.',
  modelAltSwift:
    'Mô hình 3D của Swift: một thân hình hộp với các kính thiên văn chĩa ra ở một đầu và một tấm pin mặt trời ở mỗi bên.',
  nameChandra: 'Đài quan sát tia X Chandra',
  cardChandraHello:
    'Chandra là một kính thiên văn trong vũ trụ nhìn thấy tia X, một loại ánh sáng mà mắt ta không thấy.',
  cardChandraFact1:
    'Đường đi của nó là một hình bầu dục dài. Lúc xa nhất, nó ở gần một phần ba quãng đường tới Mặt Trăng.',
  cardChandraFact2: 'Nó mất 64 giờ để đi một vòng quanh Trái Đất.',
  cardChandraFact3: 'Một tàu con thoi đã chở nó lên năm 1999.',
  modelAltChandra:
    'Mô hình 3D của Chandra: một ống dài màu bạc với một tấm pin mặt trời ở mỗi bên.',
  sceneCraft: 'Tàu vũ trụ',
  eyebrowSpaceship: 'Do con người chế tạo để khám phá vũ trụ',
  deepNoteCraft:
    'Đây là mô hình 3D do NASA làm, không phải ảnh chụp. Hãy xoay nó để nhìn từ mọi phía.',
  valueMetresEndToEnd: '{n} mét',
  nameSpaceShuttle: 'Tàu con thoi',
  cardSpaceShuttleHello:
    'Tàu con thoi là một con tàu vũ trụ chở phi hành gia và hàng hóa lên vũ trụ rồi trở về.',
  cardSpaceShuttleFact1: 'Nó bay lần đầu vào tháng 4 năm 1981.',
  cardSpaceShuttleFact2: 'Trong 30 năm, nó đã bay 135 chuyến.',
  cardSpaceShuttleFact3: 'Nó cất cánh như tên lửa và hạ cánh trên đường băng như tàu lượn.',
  modelAltSpaceShuttle:
    'Mô hình 3D của tàu con thoi đứng chĩa mũi lên: một máy bay vũ trụ màu trắng có cánh, gắn vào một bình nhiên liệu lớn màu cam, mỗi bên có một tên lửa trắng cao.',
  nameSaturnV: 'Tên lửa Saturn V',
  cardSaturnVHello: 'Saturn V là tên lửa được chế tạo để đưa con người lên Mặt Trăng.',
  cardSaturnVFact1: 'Nó cao 111 mét, cao bằng khoảng một tòa nhà 36 tầng.',
  cardSaturnVFact2: 'Nó là tên lửa mạnh nhất từng bay tính đến lúc đó.',
  cardSaturnVFact3: 'Nó được phóng lần đầu năm 1967.',
  modelAltSaturnV: 'Mô hình 3D của Saturn V: một tên lửa trắng rất cao và thon, có các vạch đen.',
  cardCassiniHello: 'Cassini là một tàu vũ trụ được gửi tới Sao Thổ.',
  cardCassiniFact1: 'Nó rời Trái Đất tháng 10 năm 1997 và tới Sao Thổ tháng 7 năm 2004.',
  cardCassiniFact2: 'Toàn bộ sứ mệnh của nó kéo dài 20 năm.',
  cardCassiniFact3:
    'Nó mang theo một tàu thăm dò nhỏ hơn, Huygens, đã hạ xuống mặt trăng Titan năm 2005.',
  modelAltCassini:
    'Mô hình 3D của Cassini: một thân cao bọc lá vàng, có chảo trắng lớn ở trên và một cần dài mảnh.',
  nameVoyager: 'Tàu vũ trụ Voyager',
  cardVoyagerHello: 'Voyager là hai tàu vũ trụ sinh đôi rời Trái Đất năm 1977.',
  cardVoyagerFact1: 'Voyager 1 đã bay ngang qua Sao Mộc và Sao Thổ.',
  cardVoyagerFact2:
    'Voyager 1 là vật đầu tiên do con người làm ra đi tới khoảng không giữa các ngôi sao.',
  cardVoyagerFact3: 'Mỗi tàu mang một đĩa vàng có lời nhắn cho bất kỳ ai tìm thấy nó.',
  modelAltVoyager:
    'Mô hình 3D của Voyager: một chảo trắng lớn trên một thân nhỏ, có các cần dài mảnh chìa ra.',
  nameLunarModule: 'Tàu đổ bộ Mặt Trăng Apollo',
  cardLunarModuleHello:
    'Tàu đổ bộ Mặt Trăng là con tàu đã đưa các phi hành gia hạ cánh xuống Mặt Trăng.',
  cardLunarModuleFact1: 'Nó chở hai phi hành gia xuống Mặt Trăng rồi bay trở lên.',
  cardLunarModuleFact2: 'Sáu chuyến bay Apollo đã hạ cánh xuống Mặt Trăng.',
  cardLunarModuleFact3: 'Mười hai phi hành gia đã đi bộ trên Mặt Trăng.',
  modelAltLunarModule:
    'Mô hình 3D của tàu đổ bộ: một khoang hình hộp bọc lá vàng, đứng trên bốn chân mảnh có đế tròn.',
  nameGemini: 'Khoang tàu Gemini',
  cardGeminiHello: 'Gemini là một tàu vũ trụ nhỏ chở hai phi hành gia.',
  cardGeminiFact1: 'Mười phi hành đoàn đã bay trong nó, vào năm 1965 và 1966.',
  cardGeminiFact2: 'Nó được đặt tên theo hình sao Song Tử (Gemini).',
  cardGeminiFact3: 'Nó bay lên vũ trụ trên một tên lửa Titan II.',
  modelAltGemini:
    'Mô hình 3D của khoang tàu Gemini: một khoang nhỏ hình nón trên một phần trắng rộng hơn.',
  cardPioneer10Hello: 'Pioneer 10 là một tàu vũ trụ được gửi đi để bay ngang qua Sao Mộc.',
  cardPioneer10Fact1: 'Nó được chế tạo để chạy 21 tháng nhưng đã hoạt động hơn 30 năm.',
  cardPioneer10Fact2:
    'Nó đi vào vành đai tiểu hành tinh tháng 7 năm 1972 và ra khỏi phía bên kia tháng 2 năm 1973.',
  cardPioneer10Fact3: 'Nó gửi về những bức ảnh Sao Mộc đẹp hơn mọi bức ảnh chụp được từ Trái Đất.',
  modelAltPioneer10:
    'Mô hình 3D của Pioneer 10: một chảo lớn trên một thân nhỏ sáu cạnh, có hai cần ngắn và một cần dài.',
  cardNewHorizonsHello: 'New Horizons là một tàu vũ trụ đã bay ngang qua Sao Diêm Vương.',
  cardNewHorizonsFact1: 'Nó bay ngang qua Sao Diêm Vương ngày 14 tháng 7 năm 2015.',
  cardNewHorizonsFact2:
    'Năm 2019, nó bay ngang qua Arrokoth, vật xa nhất từng được khám phá ở cự li gần.',
  cardNewHorizonsFact3: 'Đến năm 2024, nó đã ở xa Mặt Trời gấp 60 lần so với Trái Đất.',
  modelAltNewHorizons:
    'Mô hình 3D của New Horizons: một thân dẹt hình tam giác bọc lá vàng, có chảo trắng tròn ở trên.',
  nameCuriosity: 'Xe tự hành Curiosity',
  cardCuriosityHello: 'Curiosity là một xe tự hành: một chiếc xe rô-bốt chạy trên Sao Hỏa.',
  cardCuriosityFact1: 'Nó to cỡ một chiếc ô tô.',
  cardCuriosityFact2: 'Nó đã khám phá một nơi tên là hố Gale từ năm 2012.',
  cardCuriosityFact3: 'Nó tìm các chất hóa học là viên gạch xây nên sự sống.',
  modelAltCuriosity:
    'Mô hình 3D của xe tự hành Curiosity: một cỗ máy to cỡ ô tô có sáu bánh, một cánh tay dài và một cột gắn máy ảnh ở trên.',
  nameColumbia: 'Khoang chỉ huy Apollo 11',
  cardColumbiaHello:
    'Columbia là con tàu thật đã chở ba phi hành gia tới Mặt Trăng và trở về vào tháng 7 năm 1969.',
  cardColumbiaFact1: 'Đó là nơi ba phi hành gia sống trong phần lớn chuyến đi.',
  cardColumbiaFact2: 'Nó được phóng lên trên đỉnh một tên lửa Saturn V.',
  cardColumbiaFact3: 'Nó là phần duy nhất của con tàu trở về Trái Đất.',
  modelAltColumbia:
    'Bản quét 3D của khoang chỉ huy thật: một hình nón rộng, tù, bằng kim loại nâu cháy sém, có cửa sập và các cửa sổ nhỏ.',
  nameDiscovery: 'Tàu con thoi Discovery',
  cardDiscoveryHello:
    'Discovery là một tàu con thoi thật. Nó đã bay vào vũ trụ nhiều lần hơn mọi tàu khác.',
  cardDiscoveryFact1: 'Nó bay lần đầu năm 1984.',
  cardDiscoveryFact2: 'Nó đã bay 39 chuyến và ở trong vũ trụ 365 ngày.',
  cardDiscoveryFact3: 'Nó đã chở 184 người, cả nam và nữ, lên vũ trụ rồi trở về.',
  modelAltDiscovery:
    'Bản quét 3D của tàu con thoi Discovery thật: một máy bay vũ trụ màu trắng và xám viền đen, đã cũ sau nhiều chuyến bay, đứng trên bánh xe như trong bảo tàng.',
  deepNoteScan:
    'Đây là bản quét 3D của con tàu thật, do bảo tàng Smithsonian, nơi lưu giữ nó, thực hiện. Hãy xoay nó để nhìn từ mọi phía.',
  cardParkerSolarProbeHello:
    'Parker Solar Probe là một tàu vũ trụ bay xuyên qua phần ngoài của bầu khí quyển Mặt Trời.',
  cardParkerSolarProbeFact1:
    'Lúc gần Mặt Trời nhất, nó lao đi với tốc độ khoảng 700.000 kilômét một giờ.',
  cardParkerSolarProbeFact2: 'Một tấm chắn dày giữ cho nó an toàn trước sức nóng gần 1.400 độ C.',
  cardParkerSolarProbeFact3: 'Nó rời Trái Đất tháng 8 năm 2018.',
  modelAltParkerSolarProbe:
    'Mô hình 3D của Parker Solar Probe: một thân nhỏ nấp sau tấm chắn nhiệt trắng rộng và phẳng, có hai tấm pin mặt trời gập ở hai bên.',
  nameIss: 'Trạm Vũ trụ Quốc tế',
  cardIssHello:
    'Trạm Vũ trụ Quốc tế là một ngôi nhà trong vũ trụ, nơi các phi hành gia sống và làm việc.',
  cardIssFact1: 'Nó đi một vòng quanh Trái Đất khoảng 90 phút một lần.',
  cardIssFact2: 'Phi hành đoàn thấy 16 lần Mặt Trời mọc và 16 lần Mặt Trời lặn mỗi ngày.',
  cardIssFact3: 'Con người đã sống trên đó liên tục từ tháng 11 năm 2000.',
  modelAltIss:
    'Mô hình 3D của trạm vũ trụ: một thanh dầm dài với các tấm pin mặt trời rộng, phẳng và một cụm phòng hình ống ở giữa.',
  nameHubble: 'Kính thiên văn vũ trụ Hubble',
  cardHubbleHello: 'Kính thiên văn vũ trụ Hubble là một kính thiên văn quay quanh Trái Đất.',
  cardHubbleFact1: 'Nó đi một vòng quanh Trái Đất mỗi 95 phút.',
  cardHubbleFact2: 'Nó to bằng một chiếc xe buýt trường học cỡ lớn.',
  cardHubbleFact3: 'Các phi hành gia đã bay lên sửa nó năm lần.',
  modelAltHubble:
    'Mô hình 3D của kính thiên văn: một ống bạc sáng bóng với một tấm pin mặt trời phẳng ở mỗi bên.',
  eyebrowAsteroid: 'Tiểu hành tinh · quay quanh Mặt Trời',
  helloAsteroid: '{name} là một tiểu hành tinh.',
  eyebrowBelt: 'Vành đai · nhiều thế giới nhỏ quay quanh Mặt Trời',
  beltNote:
    'Mỗi chấm là một vật thể thật trên đường đi thật của nó. Các chấm được vẽ to hơn vật thể thật rất nhiều.',
  statDots: 'Số chấm vẽ ở đây',
  statBeltSpan: 'Tính từ Mặt Trời',
  valueTimesEarth: '{from} đến {to} lần khoảng cách của Trái Đất',
  ordinals: '1 2 3 4 5 6 7 8',
  statPlanets: 'Hành tinh',
  statStars: 'Ngôi sao',
  statSunlight: 'Ánh nắng tới Trái Đất sau',
  statSpin: 'Tự quay một vòng',
  statYear: 'Một vòng quanh Mặt Trời',
  statMoons: 'Mặt trăng',
  statWidth: 'Chiều rộng',
  statSurface: 'Bề mặt',
  statFromParent: 'Cách {parent}',
  statTripAround: 'Một vòng quanh {parent}',
  helloMoon: '{name} là một mặt trăng của {parent}.',
  valueKmWide: 'rộng {n} km',
  valueHours: '{n} giờ',
  valueEarthDays: '{n} ngày Trái Đất',
  valueEarthYears: '{n} năm Trái Đất',
  valueMinutes: 'khoảng {n} phút',
  valueEarths: 'rộng bằng {n} Trái Đất',
  valueKm: '{n} km',
  valueCelsius: 'khoảng {n} °C',
  valueOneSun: '1, Mặt Trời',
  goTo: 'Đi tới',
  speedControl: 'Thời gian trôi nhanh cỡ nào',
  speedPause: 'Tạm dừng',
  speedHourly: 'Rất chậm',
  speedSlow: 'Chậm',
  speedNormal: 'Vừa',
  speedFast: 'Nhanh',
  today: 'Hôm nay',
  timeStart: 'Cho thời gian chạy',
  timeStop: 'Dừng thời gian',
  speedOption: 'Tốc độ: {speed}',
  speedQuestion: 'Thời gian trôi nhanh cỡ nào?',
  rate: 'Một năm Trái Đất trôi qua trong {seconds} giây',
  rateHourly: 'Một giờ Trái Đất trôi qua trong 1 giây (UTC)',
  ratePaused: 'Thời gian đang dừng',
  dateLimit:
    'Bản đồ quỹ đạo của chúng ta chỉ có từ năm {from} đến năm {to}, nên thời gian dừng ở đây.',
  scaleControl: 'Mọi thứ được vẽ to và xa cỡ nào',
  scaleOptionTrue: 'Thật',
  scaleOptionTrueSizes: 'Cỡ thật',
  scaleHintTrue: 'Cỡ thật và khoảng cách thật. Mọi thứ bé tí!',
  scaleHintTrueSizes: 'Kích thước đúng. Khoảng cách gần hơn.',
  scaleHintEasy: 'To hơn và gần hơn để bạn dễ nhìn.',
  scaleQuestion: 'Mọi thứ nên trông to cỡ nào?',
  showNames: 'Hiện tên',
  settings: 'Cài đặt',
  settingsClose: 'Đóng cài đặt',
  viewMenu: 'Đổi cách hiển thị. Hiện tại: {mode}',
  scaleOptionEasy: 'Dễ nhìn',
  scaleLabelTrue: 'Kích thước thật và khoảng cách thật.',
  scaleLabelTrueSizes:
    'Các hành tinh có kích thước đúng so với nhau. Thật ra chúng ở xa nhau hơn nhiều.',
  scaleLabelEasy: 'Vẽ to hơn và gần hơn để bạn thấy được mọi thứ.',
  mapAltIo: 'Bản đồ bề mặt Io: vàng, cam và trắng, lốm đốm các núi lửa sẫm màu.',
  mapAltEuropa: 'Bản đồ bề mặt Europa: băng nhạt màu với những vết nứt dài màu nâu chạy ngang.',
  mapAltGanymede:
    'Bản đồ bề mặt Ganymede: vùng đất cũ sẫm màu và vùng đất có rãnh sáng hơn, với các hố va chạm sáng.',
  mapAltCallisto: 'Bản đồ bề mặt Callisto: nâu sẫm và phủ kín các hố va chạm sáng.',
  mapAltTitan: 'Bản đồ Titan nhìn từ bên ngoài: một lớp sương mù màu cam mịn che khuất mặt đất.',
  mapAltEnceladus:
    'Bản đồ bề mặt Enceladus: băng sáng với các hố va chạm ở phía bắc và những vết nứt dài ở phía nam.',
  mapAltTethys: 'Bản đồ bề mặt Tethys: băng xám phủ đầy hố va chạm.',
  mapAltDione: 'Bản đồ bề mặt Dione: băng xám với các hố va chạm và những vệt sáng mỏng manh.',
  mapAltRhea: 'Bản đồ bề mặt Rhea: băng xám phủ đầy hố va chạm.',
  mapAltIapetus: 'Bản đồ bề mặt Iapetus: một nửa rất tối và nửa kia sáng.',
  mapAltMiranda:
    'Bản đồ bề mặt Miranda: băng xám lộn xộn ở phía nam. Phía bắc để xám trơn vì chưa từng được chụp ảnh.',
  mapAltAriel:
    'Bản đồ bề mặt Ariel: băng xám có các thung lũng ở phía nam. Phía bắc để xám trơn vì chưa từng được chụp ảnh.',
  mapAltUmbriel:
    'Bản đồ bề mặt Umbriel: xám sẫm với các hố va chạm ở phía nam. Phía bắc để xám trơn vì chưa từng được chụp ảnh.',
  mapAltTitania:
    'Bản đồ bề mặt Titania: xám ngả nâu với các hố va chạm và thung lũng dài ở phía nam. Phía bắc để xám trơn vì chưa từng được chụp ảnh.',
  mapAltOberon:
    'Bản đồ bề mặt Oberon: xám ngả nâu với các hố va chạm sáng ở phía nam. Phía bắc để xám trơn vì chưa từng được chụp ảnh.',
  mapAltTriton:
    'Bản đồ bề mặt Triton: băng hồng nhạt ở phía nam. Phía bắc để xám trơn vì chưa từng được chụp ảnh.',
  mapAltPluto:
    'Bản đồ bề mặt Sao Diêm Vương: nâu đỏ và trắng, có một đồng bằng sáng hình trái tim. Vùng cực nam bị mờ vì chưa từng được nhìn ở gần.',
  mapAltCeres: 'Bản đồ bề mặt Ceres: xám và phủ đầy hố va chạm, có vài đốm sáng.',
  mapAltVesta:
    'Bản đồ bề mặt Vesta: xám, phủ đầy hố va chạm, có những rãnh dài chạy quanh phần giữa.',
  mapAltMimas: 'Bản đồ bề mặt Mimas: băng giá và dày đặc hố va chạm, trong đó có một hố rất lớn.',
  mapAltPhobos:
    'Bản đồ bề mặt Phobos: xám và bụi bặm, có các hố va chạm và rãnh dài. Một hố rất lớn.',
  mapAltEros: 'Bản đồ bề mặt Eros: xám với các hố va chạm, một số có vành sáng.',
  mapAltMercury: 'Bản đồ bề mặt Sao Thủy: xám và phủ đầy hố va chạm.',
  mapAltVenus: 'Bản đồ mặt đất Sao Kim làm bằng ra-đa, màu sắc do các nhà khoa học thêm vào.',
  mapAltEarth:
    'Bản đồ Trái Đất nhìn từ vũ trụ: đại dương xanh lam, đất liền xanh lục và nâu, băng trắng ở hai cực.',
  mapAltMoon: 'Bản đồ bề mặt Mặt Trăng: xám với những mảng tối hơn và nhiều hố va chạm.',
  mapAltMars: 'Bản đồ Sao Hỏa: màu cam gỉ sắt với những vùng tối hơn và băng trắng ở hai cực.',
  mapAltJupiter: 'Bản đồ mây của Sao Mộc với các sọc màu kem và nâu, cùng Vết Đỏ Lớn.',
  mapAltSaturn: 'Hình vẽ của họa sĩ về các dải mây vàng nhạt của Sao Thổ.',
  mapAltUranus: 'Hình vẽ của họa sĩ về Sao Thiên Vương: xanh lam pha lục nhạt, trơn mịn.',
  mapAltNeptune: 'Hình vẽ của họa sĩ về Sao Hải Vương: xanh lam đậm với vài đám mây trắng.',
  modelAltSun:
    'Mô hình 3D của Mặt Trời: một quả cầu vàng cam sáng rực với bề mặt lốm đốm, phát sáng.',
  mediaKindComposite: 'Ghép từ nhiều bức ảnh lại với nhau.',
  mediaKindFalseColour: 'Màu sắc do các nhà khoa học thêm vào.',
  mediaKindArtistConcept: 'Hình vẽ của họa sĩ, không phải ảnh chụp.',
  mediaKindAgencyModel:
    'Lấy từ một mô hình 3D do NASA làm. NASA không nói rõ đó là ảnh chụp hay hình vẽ.',
  globeUnseen: 'Phần trơn hoặc mờ là phần chưa từng được chụp ảnh.',
  mediaKindSimulation: 'Mô phỏng bằng máy tính, không phải ảnh chụp.',
  mediaKindDiagram: 'Sơ đồ, không phải ảnh chụp.',
  showNamesHint: 'Nhãn tên bên cạnh mỗi nơi',
  grownUpsHint: 'Quyền riêng tư · nguồn',
  languageQuestion: 'Ngôn ngữ',
  languageEnglish: 'English',
  languageVietnamese: 'Tiếng Việt',

  // Names the catalogue carries in English.
  nameMercury: 'Sao Thủy',
  nameVenus: 'Sao Kim',
  nameEarth: 'Trái Đất',
  nameMars: 'Sao Hỏa',
  nameJupiter: 'Sao Mộc',
  nameSaturn: 'Sao Thổ',
  nameUranus: 'Sao Thiên Vương',
  nameNeptune: 'Sao Hải Vương',
  namePluto: 'Sao Diêm Vương',
  nameAsteroidBelt: 'Vành đai tiểu hành tinh',
  nameKuiperBelt: 'Vành đai Kuiper',
  nameOrion: 'Chòm Lạp Hộ',
  nameCassiopeia: 'Chòm Thiên Hậu',
};
