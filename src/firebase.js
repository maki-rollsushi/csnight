// ============================================================
//  firebase.js  –  Firestore integration
//
//  GUEST DATA STRATEGY:
//  All 124 guest records are baked directly into this file as
//  two O(1) lookup maps (by hash and by docId).
//  fetchGuestByCipher() and fetchGuestById() are now instant —
//  no network call, no cache, no latency.
//
//  Each guest now includes a pre-assigned tableNumber from the seat plan.
//
//  Firestore is still used ONLY for:
//    • access_log        (enter / exit events)
//    • task_assignments  (task + table numbers)
//  These need real-time cross-device consistency, so they stay online.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrbdjppWzTiDaWiAagO0cha2sX_hthXXw",
  authDomain: "csnight-e86c7.firebaseapp.com",
  projectId: "csnight-e86c7",
  storageBucket: "csnight-e86c7.firebasestorage.app",
  messagingSenderId: "697686912207",
  appId: "1:697686912207:web:e4a5deea7a5108ed48dbba",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Hardcoded guest registry ──────────────────────────────────
// Source: CS_NIGHT_2026__The_Reboot__Payment_Portal___REAL__-_Attendees__2_.csv
// 124 attendees · generated 2026-04-29
// To update the list: re-run the CSV parser and replace this array.

const GUEST_LIST = [
  {
    docId: "0001",
    hash: "f129323c1e3a61794860beed385c025c",
    name: "Abela, Niño, S",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4B",
    tableNumber: "3",
  },
  {
    docId: "0002",
    hash: "bc1acde6340772cdca275451a8ca2a27",
    name: "Abigan, Aisaac Josh, C.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "3",
  },
  {
    docId: "0003",
    hash: "b1151cd5d3cd4d4258e30b391a5cebd6",
    name: "Abitria, Charles Kenneth C.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "10",
  },
  {
    docId: "0004",
    hash: "748e4bc5d628ecdf854cb7db8346fa7c",
    name: "Acayen, Angela Mae S.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "9",
  },
  {
    docId: "0005",
    hash: "d7c212743a62542169b5986989d21b4f",
    name: "Arjona, Stephanie Rose B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 2A",
    tableNumber: "JACK",
  },
  {
    docId: "0006",
    hash: "179ca2a59ad72925c9c4e62c0fa8b15a",
    name: "Badillo, Mary Jasmin, M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1C",
    tableNumber: "KING",
  },
  {
    docId: "0007",
    hash: "49d049ee237eee0a04152569ba2a7060",
    name: "Baile, Nadine R.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0008",
    hash: "ddc0ab391027318e71c4e0cfd2a5fc3e",
    name: "Balares, Leo Nicola, B",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0009",
    hash: "2df19b1c94a6bccd2246fa1e3167bd86",
    name: "Balidoya, Airah Mae T.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "4",
  },
  {
    docId: "0010",
    hash: "73d0a1763a4c47a02acb122e84ebb59d",
    name: "Balingbing, Rom-Ann May P",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0011",
    hash: "72ad44a92378a1358a6de92d468c4e5a",
    name: "Baltasar, Manuel James L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "3",
  },
  {
    docId: "0012",
    hash: "0b7ab2bfd9d965bcc29083006e0c1ef5",
    name: "Barbacena, Jenny B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "KING",
  },
  {
    docId: "0013",
    hash: "eafa3d5f53eea4574153e224ec980502",
    name: "Basilla Allen B",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "9",
  },
  {
    docId: "0014",
    hash: "2a697a08fc3f6c056ab08ac3b46d4d44",
    name: "Bedar, Eric John G.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "10",
  },
  {
    docId: "0015",
    hash: "57e5da2295e93aa8fc25d49d93ab84b0",
    name: "Bejerano, John Allen B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
  },
  {
    docId: "0016",
    hash: "36564ff848af7390a7325b578873d1b9",
    name: "Belaro, Ken, C",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
  },
  {
    docId: "0017",
    hash: "21ea16632921e9399a65cf9a14e2b9e4",
    name: "Bellen, Ma. Leivette R.",
    paymentStatus: "Partial Installment – Pending Completion",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "7",
  },
  {
    docId: "0018",
    hash: "e0d591371047b723e3c47b046852f068",
    name: "Belludo, Maria Princess Angela M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "9",
  },
  {
    docId: "0019",
    hash: "be0ad5dc2f2040f153171d6fa8da2203",
    name: "Bolaños, Lance Andrei C.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4C",
    tableNumber: "3",
  },
  {
    docId: "0020",
    hash: "7e5e5aa3594754f0ac30458fc2929ca6",
    name: "Bolaños, Ruzcel Steve M.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 1A",
    tableNumber: "6",
  },
  {
    docId: "0021",
    hash: "b124bc90ed9066d74e5f6f443c2f9255",
    name: "Bongon, Mark Andrew A.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "ACE",
  },
  {
    docId: "0022",
    hash: "02a726c78faaeed2d5dc9fdbdb8c8746",
    name: "Borbe, Austin Jared B.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 2B",
    tableNumber: "JACK",
  },
  {
    docId: "0023",
    hash: "d949ad35a76985fac0a9ec7417e7cee5",
    name: "Borillo, Jaila Mae E.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1C",
    tableNumber: "KING",
  },
  {
    docId: "0024",
    hash: "cbd112eb3c97ec04425e758022236275",
    name: "Bravo, Simon Paul B.",
    paymentStatus: "Installment – Pending Completion",
    dietaryRestrictions: "None",
    section: "BSCS 1A",
    tableNumber: "6",
  },
  {
    docId: "0025",
    hash: "68e6648dd87d8f354413116a63df6297",
    name: "Briz, Razella Jenneth",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Vegetarian / Vegan, Peanut / Nut Allergy",
    section: "BSCS 1A",
    tableNumber: "6",
  },
  {
    docId: "0026",
    hash: "553ca878a3320123a16865853b9d17ef",
    name: "BUHION, BRIAN ADAMS B",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "No Pork (Religious/Personal)",
    section: "BSCS 4B",
    tableNumber: "10",
  },
  {
    docId: "0027",
    hash: "1381e4a89196b5dccced9a4494cb09aa",
    name: "Bulawan, Neal Errol K.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "4",
  },
  {
    docId: "0028",
    hash: "9349af5e332b864eb03bbacc8ea3c9f2",
    name: "Burce, Nadine Franz B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0029",
    hash: "f25e866db902a7db83b9e83835b42223",
    name: "Cadag, Jaycee D.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0030",
    hash: "c2957726c9beeffeffe4d8429dc5c254",
    name: "Callos, Maria Dorothy A.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0031",
    hash: "79fedb152711bfc1c7167c08ad7394c1",
    name: "Camasis, Princess Ida, M",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1C",
    tableNumber: "KING",
  },
  {
    docId: "0032",
    hash: "74672719827542626fd77e308284613d",
    name: "CAMU, DAISY R.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "9",
  },
  {
    docId: "0033",
    hash: "0dc1999505f949df97e18e4152540e01",
    name: "Camu, Dianne R.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "10",
  },
  {
    docId: "0034",
    hash: "bd985f321f1f88f7b1c39efa22fb8773",
    name: "Cea, Jarmaine Mouel G.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 2B",
    tableNumber: "JACK",
  },
  {
    docId: "0035",
    hash: "eb1eb7d7a91ebdbc7e0250e5477aec54",
    name: "Cerillo, Bea Marie T.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "7",
  },
  {
    docId: "0036",
    hash: "c387d04d0e1650274dbd739b67d9a266",
    name: "Dating, Christine Janelle, A",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 2B",
    tableNumber: "JACK",
  },
  {
    docId: "0037",
    hash: "fd7249ff02a698dd24798cd91ae0711d",
    name: "Davalos, John Mark, E.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1A",
    tableNumber: "6",
  },
  {
    docId: "0038",
    hash: "bc82737e0e58641fe92254b5be3dd073",
    name: "Dela Cruz, Mark L.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "ACE",
  },
  {
    docId: "0039",
    hash: "7f8710fac55f1dc99a8ec1aac995153b",
    name: "Domasian, Mea M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "2",
  },
  {
    docId: "0040",
    hash: "f2e18df46b8b0850c7d75a5a03338a57",
    name: "Domingo, Jonathan Ray C.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Shellfish",
    section: "BSCS 4B",
    tableNumber: "10",
  },
  {
    docId: "0041",
    hash: "57e0166afd61b2de6260b916f52a0f39",
    name: "Donato, Juanico Leon C.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "10",
  },
  {
    docId: "0042",
    hash: "e60077f93de289734c98d6cd2823dcfb",
    name: "Espinas, A Z Rain, L",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0043",
    hash: "fa315e9e8aff0afb595317bf4a2ab92c",
    name: "Espiritu, Johnry E.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "No Beef",
    section: "BSCS 4A",
    tableNumber: "KING",
  },
  {
    docId: "0044",
    hash: "5fb1f5f2e5dd481da50f90f93bec68ca",
    name: "Evangelista, Mary Joy L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "10",
  },
  {
    docId: "0045",
    hash: "43d80d8bc3940a38101661a52ec8e1af",
    name: "Farochilen, Luis Mario D.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "10",
  },
  {
    docId: "0046",
    hash: "04485ae75401e5ef31b2c05e5b8c0638",
    name: "Froyalde, Carl Ivanne V.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "2",
  },
  {
    docId: "0047",
    hash: "f63b94fd566dd24c411ff130a7dcfd14",
    name: "Galias, Alyanna Louise",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0048",
    hash: "5512025cbdfeca5f94e5589981d52405",
    name: "Gaor, Marc Damme R.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "9",
  },
  {
    docId: "0049",
    hash: "f753e1653508b30090120694cf092cd1",
    name: "Girado, John Omar, N",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "3",
  },
  {
    docId: "0050",
    hash: "96faf8230ed69a5eddcc06a0ed3fd848",
    name: "Gomez, Rhain B.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "7",
  },
  {
    docId: "0051",
    hash: "8a69f6f2d9e2848aab4f3b6f8436bd81",
    name: "Guibao, Tricia Q.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "No Pork (Religious/Personal)",
    section: "BSCS 4B",
    tableNumber: "9",
  },
  {
    docId: "0052",
    hash: "3ee5234f3654f426221d23ca1cf433d1",
    name: "Hubilla, Ariane, E",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "9",
  },
  {
    docId: "0053",
    hash: "b8543ab17fac14a15d926079baf45fbd",
    name: "Jesalva, Cyrrhus L",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4A",
    tableNumber: "4",
  },
  {
    docId: "0054",
    hash: "17d09011e1855a60eb8312d1c2dd131b",
    name: "Lagarde, Christian M.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "7",
  },
  {
    docId: "0055",
    hash: "3048d1e066a61538b769d69287b54162",
    name: "Lao, Vencer, A",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "2",
  },
  {
    docId: "0056",
    hash: "9ac19e4a3c3d09d657de8a6d16c1843b",
    name: "Latorre, Jeo D.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "7",
  },
  {
    docId: "0057",
    hash: "554e724ae7eec9f9e241077c1e435e31",
    name: "Lesano, Lenard M",
    paymentStatus: "Partial Installment – Pending Completion",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "7",
  },
  {
    docId: "0058",
    hash: "c5a3a0d4a914f2fc32aa693512143a23",
    name: "Lising, Isaiah Daniel B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "3",
  },
  {
    docId: "0059",
    hash: "f607514267b25f8d353193784c53ba08",
    name: "Lisondra, Kristoffer Ross L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "4",
  },
  {
    docId: "0060",
    hash: "378ce984b121294ef36a0f5ca517a4d9",
    name: "Llorca, John Mark, A",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "9",
  },
  {
    docId: "0061",
    hash: "7e33174640cdf2c3afc2ebee6f8d52bf",
    name: "Loares, Kenrik Lee",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "10",
  },
  {
    docId: "0062",
    hash: "5365fb67ce8515d90fe0b78fa3b4d08a",
    name: "Lopera, Wesly P.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4A",
    tableNumber: "4",
  },
  {
    docId: "0063",
    hash: "3710af924fd4a55752e27442c80effea",
    name: "Luces, Dominique Isabelle C.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "JACK",
  },
  {
    docId: "0064",
    hash: "8368f942875f6905a70c3cc835311764",
    name: "Maceda, Meja Lian Lyka M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "2",
  },
  {
    docId: "0065",
    hash: "52c38a752a2e592e2ccd1cdd10b18dcc",
    name: "Madriñan, Yunise Ellaine B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "No Chicken, Seafood Allergy",
    section: "BSCS 4C",
    tableNumber: "2",
  },
  {
    docId: "0066",
    hash: "20b4378215af3fac1dcc2d1acf1acd51",
    name: "Making, Brian L.",
    paymentStatus: "Partial Installment – Pending Completion",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "7",
  },
  {
    docId: "0067",
    hash: "694f8e6bdd6718ad4761d15770e91a98",
    name: "Mallorca, Ershee M.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0068",
    hash: "63390b391313642076ac74ea50b99a25",
    name: "Maravillo, Sean Gabrille, V.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "2",
  },
  {
    docId: "0069",
    hash: "a1078af35b7ca54ac7174488d89831db",
    name: "Marbida, Jan Christian, N.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "JACK",
  },
  {
    docId: "0070",
    hash: "fde3a1160d586fd793969e879a96a26d",
    name: "Millan, Ericka Maelene M.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0071",
    hash: "8260d2b00d7e17af7c9529271729baa1",
    name: "Miranda, Maria Lourdes, S",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4A",
    tableNumber: "KING",
  },
  {
    docId: "0072",
    hash: "8e16ab13825d5273023368c86b98ef1b",
    name: "Molleno, Eunesse A.",
    paymentStatus: "Partial Installment – Pending Completion",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "7",
  },
  {
    docId: "0073",
    hash: "623e4198fedcbc95dc886fb6f7641c61",
    name: "Montas, Asharelah Eziel, T.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 2A",
    tableNumber: "JACK",
  },
  {
    docId: "0074",
    hash: "92b7c7a9d57e0b42493e06e883b9d71f",
    name: "Morcozo, Janna Carla, R",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0075",
    hash: "9f2fd315367d41718982b00db01948b4",
    name: "Moreno, Rens, L.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 2A",
    tableNumber: "ACE",
  },
  {
    docId: "0076",
    hash: "76a402fbfd1e654496aefa25eaa6af75",
    name: "Narvaez, Simon S.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0077",
    hash: "4118e8e78920d64d9356624a345ba5a7",
    name: "Nasayao, Gabriel Kyle, R.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1A",
    tableNumber: "6",
  },
  {
    docId: "0078",
    hash: "f0fd6a540c67f9c206408aa9c2b0021e",
    name: "Nisola, Jessica, M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 2B",
    tableNumber: "JACK",
  },
  {
    docId: "0079",
    hash: "1cc8890487889995973be037bf5daff1",
    name: "Olayta, Clarence P.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "10",
  },
  {
    docId: "0080",
    hash: "f40713f9498d1e88bbd08b5eea4694d9",
    name: "Paraiso, Jhoanna Sherry, T",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "2",
  },
  {
    docId: "0081",
    hash: "4903414363b0d9701c6b82621774c41d",
    name: "Parillas, Vinz Xanden, A.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1A",
    tableNumber: "6",
  },
  {
    docId: "0082",
    hash: "35b19dfdcfafdbface505a2339dbc451",
    name: "Pielago, Salve Adelle, P.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Shrimp Allergy",
    section: "BSCS 3A",
    tableNumber: "5",
  },
  {
    docId: "0083",
    hash: "2fa90526a2989e3a5d5a765009c63737",
    name: "Piojo, Lailanie Mae L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1C",
  },
  {
    docId: "0084",
    hash: "958deb232f320c6e9f910c28bd263eb7",
    name: "Pispis, Gerald Christian, G.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "No Chicken",
    section: "BSCS 4A",
    tableNumber: "4",
  },
  {
    docId: "0085",
    hash: "81cfea9063a12ff46709d67497da24da",
    name: "Poot, Camille Pamela",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "JACK",
  },
  {
    docId: "0086",
    hash: "ddac564af058827281f9b2f78f291f68",
    name: "Quiñones, James Bryan O.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "KING",
  },
  {
    docId: "0087",
    hash: "8d5a90733db8cf7edfbc640947689150",
    name: "Ramin, Saerelety Stephania C.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "JACK",
  },
  {
    docId: "0088",
    hash: "d4c999b893c6fb177e3f18fdb47bdef1",
    name: "Razo, Yesha Zaire M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "2",
  },
  {
    docId: "0089",
    hash: "8dbc561e72816dcf0eb613fc3ac598fa",
    name: "Rebaya, Hiro Jucef, B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
    tableNumber: "4",
  },
  {
    docId: "0090",
    hash: "218495b5910fd5f41e434b646a687034",
    name: "Recomendable, Roshan Pearl A.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4C",
    tableNumber: "9",
  },
  {
    docId: "0091",
    hash: "8023ee64a9b41caef8046e2f6b43fe68",
    name: "San Jose, Carl Edward L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "ACE",
  },
  {
    docId: "0092",
    hash: "c7adacd63b92fce4e0ab6720ef7a95be",
    name: "San Juan, Jacinta Aimee G",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "KING",
  },
  {
    docId: "0093",
    hash: "3f42032fd880e0780826bfba8c91fec9",
    name: "Sanchez, Benedict, P",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4B",
  },
  {
    docId: "0094",
    hash: "d5a8fc0b2dae82df96386c1d581faf6c",
    name: "Sanoria, Gessa Melnon",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "2",
  },
  {
    docId: "0095",
    hash: "ce327192ebb331ba782f8c4a5242fc8f",
    name: "Santiago, Allyza Rhyne, M",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1C",
    tableNumber: "KING",
  },
  {
    docId: "0096",
    hash: "ec04d037679e3c269c3fd13023126f45",
    name: "Sariba, Lorie Andelene B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0097",
    hash: "b578ec385fcb19927711f534cac3e7cf",
    name: "Sayson, Shea Irie, R.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 1A",
    tableNumber: "6",
  },
  {
    docId: "0098",
    hash: "08857188fd41cf88c91369e76da96358",
    name: "Severo, Maxine Elizabeth O.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "2",
  },
  {
    docId: "0099",
    hash: "9070124e0a88f9d41f62d774c7d0ba3a",
    name: "Solano, Kate Bernadette H.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0100",
    hash: "73ddcac59c1b10dcbb31c5cf3a950295",
    name: "Tabayag, Xaris Joy D",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "ACE",
  },
  {
    docId: "0101",
    hash: "9591c3aeac39707c2980ed7d7f3e11c4",
    name: "Tolosa, Juliana Jan Marie, D",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "Seafood Allergy",
    section: "BSCS 4C",
    tableNumber: "QUEEN",
  },
  {
    docId: "0102",
    hash: "966ec282e6e64c28016b90cfcd3ddffd",
    name: "Valdemoro, Azer John, O.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "3",
  },
  {
    docId: "0103",
    hash: "43c0a1db6b1b5d32fab5b7d0b4ca49a7",
    name: "Vergara, Louis Mathew T.",
    paymentStatus: "Installment – Completed",
    dietaryRestrictions: "None",
    section: "BSCS 4A",
    tableNumber: "4",
  },
  {
    docId: "0104",
    hash: "df12f1e4630fcd60d265c1e212f511b5",
    name: "Vitangcul, Steven Jethro P.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "9",
  },
  {
    docId: "0105",
    hash: "460f2ac11b9dfd648973b0dca67fa197",
    name: "Yamson, Jenny Mae M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "No Chicken",
    section: "BSCS 4A",
    tableNumber: "4",
  },
  {
    docId: "0106",
    hash: "be91f95af38f56bdad19a62ea13198c0",
    name: "Delabahan, Vim M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 4C",
    tableNumber: "ACE",
  },
  {
    docId: "0107",
    hash: "b0f46e0691d25a44bb2177e08c2710ce",
    name: "Abrahan, Barbie T.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "No Chicken",
    section: "BSCS 4C",
    tableNumber: "ACE",
  },
  {
    docId: "0108",
    hash: "8942f5fea14566c995c3865d8bb4a200",
    name: "Ricamunda, Rei Nathaniel B.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1A",
    tableNumber: "ACE",
  },
  {
    docId: "0109",
    hash: "8a228c418bb28fce8435b8691abb1ab4",
    name: "Gamis, Shana Aislinn M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "ACE",
  },
  {
    docId: "0110",
    hash: "e5a3366e88018926c72774a0e2e0a545",
    name: "Santos, Gebhel Anselm M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 2A",
    tableNumber: "ACE",
  },
  {
    docId: "0111",
    hash: "0879dd96f102df5b6b168883f195f0c8",
    name: "Balang, Julie Ann M.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0112",
    hash: "55b8c10c70044f7b140f5a071acb4a1e",
    name: "Austero, Lea D.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0113",
    hash: "17b35df6c66c84a0a2dfc1ef68658c3d",
    name: "Brogada, Michael Angelo D.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0114",
    hash: "6f13db357a7e8c7a5a70dcfb9aaea7b7",
    name: "Canon, Mary Joy P.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0115",
    hash: "5ad25c3becfd7b3266dfce44ba563edb",
    name: "Maceda, Lany L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0116",
    hash: "3474f126659b1b52e32d73f4df2cf0d5",
    name: "Llovido, Jennifer L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0117",
    hash: "fe74c46781b5127ea39f0c53a606641d",
    name: "Sy, Christian Y.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0118",
    hash: "8d3eda6a6a7f23d2d94abd618bddb28c",
    name: "Satuito, Arlene A.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0119",
    hash: "ce3bcc386148e03c20a6421589e9d556",
    name: "Serrano, Jocelyn E.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "JOKER",
  },
  {
    docId: "0120",
    hash: "70e7f9b9a6cf1a009fa4085b628c56b6",
    name: "Nate, Clyde Justin N.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "8",
  },
  {
    docId: "0121",
    hash: "ed743bc387dcadceb247d28371cf70f6",
    name: "Bronzal, Lance Stephen L.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "Faculty",
    tableNumber: "8",
  },
  {
    docId: "0122",
    hash: "c755a82b84061e214e46bda8cd852a5b",
    name: "Abdula, Maria Francia",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3B",
    tableNumber: "5",
  },
  {
    docId: "0123",
    hash: "655e8c0e147701d70aecb6bed57f1b3d",
    name: "Ocenar, Viktor Cassidy",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 3A",
    tableNumber: "8",
  },
  {
    docId: "0124",
    hash: "75fd7336d40a97c6cf9df09cda97b9ff",
    name: "Flores, John Andrei A.",
    paymentStatus: "Full Payment",
    dietaryRestrictions: "None",
    section: "BSCS 1A",
    tableNumber: "6",
  },
];

// Build O(1) lookup maps at module load — synchronous, zero network cost
const BY_HASH = new Map(GUEST_LIST.map((g) => [g.hash, g]));
const BY_DOCID = new Map(GUEST_LIST.map((g) => [g.docId, g]));

// ── Instant guest lookups (zero network) ─────────────────────

/** Look up a guest by MD5 hash (scanned from QR code). Synchronous. */
export function fetchGuestByCipher(hash) {
  return BY_HASH.get(hash.trim().toLowerCase()) ?? null;
}

/** Look up a guest by zero-padded doc ID (e.g. "42" or "0042"). Synchronous. */
export function fetchGuestById(id) {
  return BY_DOCID.get(String(id).padStart(4, "0")) ?? null;
}

/** Return the full guest list (used by the summary modal). */
export function getAllGuests() {
  return GUEST_LIST;
}

// ── Access log (Firestore) ────────────────────────────────────

/** Log an entry or exit event. */
export async function logAccess(guestDocId, action) {
  return addDoc(collection(db, "access_log"), {
    guestId: String(guestDocId),
    action,
    timestamp: serverTimestamp(),
  });
}

/** Last access action for a guest (used to toggle enter ↔ exit). */
export async function getLastAction(guestDocId) {
  const q = query(
    collection(db, "access_log"),
    where("guestId", "==", String(guestDocId)),
    orderBy("timestamp", "desc"),
    limit(1),
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data().action;
}

/** Count guests currently inside (enter events minus exit events). */
export async function countInside() {
  const [enters, exits] = await Promise.all([
    getDocs(
      query(collection(db, "access_log"), where("action", "==", "enter")),
    ),
    getDocs(query(collection(db, "access_log"), where("action", "==", "exit"))),
  ]);
  return Math.max(0, enters.size - exits.size);
}

// ── Task & Table Assignments (Firestore) ──────────────────────

/**
 * task_assignments doc shape (doc ID = guestDocId):
 * {
 *   taskNumber:  "42",   ← "1"–"107" or "00" (wildcard)
 *   tableNumber: "5",    ← seating table (optional)
 *   timestamp: serverTimestamp(),
 * }
 */

/** Get a guest's task + table assignment. tableNumber comes from GUEST_LIST (seat plan). */
export async function getAssignment(guestDocId) {
  const padded = String(guestDocId).padStart(4, "0");
  const guest = BY_DOCID.get(padded);
  const tableNumber = guest?.tableNumber ?? null;
  const ref = doc(db, "task_assignments", padded);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { taskNumber: null, tableNumber };
  const { taskNumber = null } = snap.data();
  return { taskNumber, tableNumber };
}

/** Get all taken task numbers as a string array (for availability checks). */
export async function getTakenTaskNumbers() {
  const snap = await getDocs(collection(db, "task_assignments"));
  return snap.docs.map((d) => d.data().taskNumber).filter(Boolean);
}

/** Write task number for a guest. tableNumber is baked into GUEST_LIST (seat plan). */
export async function assignTaskAndTable(guestDocId, taskNumber) {
  await setDoc(doc(db, "task_assignments", String(guestDocId)), {
    taskNumber: String(taskNumber),
    timestamp: serverTimestamp(),
  });
}

/**
 * Build the attendee summary.
 * Guest info comes from the in-memory map (instant, no Firestore).
 * Only the two small event collections are fetched from Firestore.
 */
export async function getSummary() {
  const [logsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, "access_log")),
    getDocs(collection(db, "task_assignments")),
  ]);

  // assignment map:  guestDocId → { taskNumber, tableNumber }
  const assignMap = {};
  tasksSnap.docs.forEach((d) => {
    assignMap[d.id] = {
      taskNumber: d.data().taskNumber ?? null,
      tableNumber: d.data().tableNumber ?? null,
    };
  });

  // last-action map:  guestId → { action, timestamp, ms }
  const lastActions = {};
  logsSnap.docs.forEach((d) => {
    const { guestId, action, timestamp } = d.data();
    const ms = timestamp?.toMillis?.() ?? 0;
    if (!lastActions[guestId] || ms > lastActions[guestId].ms) {
      lastActions[guestId] = { action, timestamp, ms };
    }
  });

  const summary = Object.entries(lastActions).map(
    ([guestId, { action, timestamp }]) => ({
      guest: BY_DOCID.get(guestId) ?? {
        docId: guestId,
        name: `Guest ${guestId}`,
      },
      status: action,
      taskNumber: assignMap[guestId]?.taskNumber ?? null,
      tableNumber: BY_DOCID.get(guestId)?.tableNumber ?? null,
      lastTimestamp: timestamp,
    }),
  );

  summary.sort((a, b) =>
    (a.guest.name ?? "").localeCompare(b.guest.name ?? ""),
  );
  return summary;
}

/**
 * Reset: delete every document in access_log + task_assignments.
 * Runs in batches of 500 (Firestore hard limit).
 */
export async function resetAll() {
  const [logs, tasks] = await Promise.all([
    getDocs(collection(db, "access_log")),
    getDocs(collection(db, "task_assignments")),
  ]);
  const allDocs = [...logs.docs, ...tasks.docs];
  if (!allDocs.length) return;
  for (let i = 0; i < allDocs.length; i += 500) {
    const b = writeBatch(db);
    allDocs.slice(i, i + 500).forEach((d) => b.delete(d.ref));
    await b.commit();
  }
}