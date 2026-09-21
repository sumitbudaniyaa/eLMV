# Legal Metrology Instruments & Statutory Compliance Reference Guide

> **Official Metrological Manual**: Statutory weighing and measuring instruments regulated under the **Legal Metrology Act, 2009 (Act No. 1 of 2010)**, the **Legal Metrology (General) Rules, 2011**, State Legal Metrology (Enforcement) Rules, and international **OIML** (International Organization of Legal Metrology) recommendations.

---

## 1. Statutory Context & Legal Foundation

### 1.1 What is Legal Metrology?
Metrology is the science of measurement, divided into three domains:
1. **Scientific Metrology**: Realization and maintenance of primary measurement standards (managed in India by the **National Physical Laboratory - NPL, New Delhi**).
2. **Industrial Metrology**: Calibration and quality control within factory production lines and laboratories.
3. **Legal Metrology**: The mandatory application of statutory enactments to measurements, measuring instruments, and units of measurement to safeguard **consumers, public health, safety, environmental protection, and fair commercial trade**.

Under the **Legal Metrology Act, 2009**, any instrument used in commercial transactions, industrial trade, public custody transfer, or medical diagnosis must undergo mandatory **Model Approval** and periodic **Verification & Stamping** before deployment.

### 1.2 Hierarchy of Measurement Standards in India
$$\text{National Prototype Standard (NPL New Delhi)} \longrightarrow \text{Reference Standards (RRSL)} \longrightarrow \text{Secondary Standards (State Labs)} \longrightarrow \text{Working Standards (LMO Field Kits)} \longrightarrow \text{Commercial Instruments}$$

- **Regional Reference Standards Laboratories (RRSL)**: Located at Ahmedabad, Bangalore, Bhubaneswar, Faridabad, and Guwahati.
- **Working Standards**: Traceable weights and volumetric measures carried by **Legal Metrology Officers (LMOs)** and **GATC Inspectors** into the field.
- **Section 22 (Model Approval)**: Mandates central type approval before manufacturing or importing any weighing/measuring instrument into India.
- **Section 24 (Verification & Stamping)**: Mandates that no person shall use any weight or measure in any commercial transaction unless it has been verified and stamped by an authorized legal metrology officer.
- **Sections 30, 34 & 35**: Prescribes penalties, fines, and imprisonment for operating unverified instruments, tampering with seals, or delivering short weights/measures.

---

## 2. The Core Dichotomy: NAWI vs. AWI

Under international metrology standards (**OIML**) and the **Seventh Schedule** of the **Legal Metrology (General) Rules, 2011**, all weighing instruments are fundamentally divided into two major classes: **Non-Automatic Weighing Instruments (NAWI)** and **Automatic Weighing Instruments (AWI)**.

```
                             ┌───────────────────────────────────────┐
                             │       Weighing Instruments           │
                             └───────────────────┬───────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
        ┌───────────────────────────────┐                 ┌───────────────────────────────┐
        │  NAWI (Non-Automatic Weighing)│                 │    AWI (Automatic Weighing)   │
        ├───────────────────────────────┤                 ├───────────────────────────────┤
        │ • Operator intervention       │                 │ • Automatic / Programmed      │
        │ • Load manually placed/read   │                 │ • Material in motion/dynamic  │
        │ • Standard: OIML R 76         │                 │ • Standards: OIML R 50/51/61  │
        │ • Rules: Seventh Schedule (A) │                 │ • Rules: Seventh Schedule (C) │
        │ • Examples: Retail scales,    │                 │ • Examples: Checkweighers,    │
        │   jewellery balances,         │                 │   belt weighers, automatic    │
        │   truck weighbridges          │                 │   bagging fillers             │
        └───────────────────────────────┘                 └───────────────────────────────┘
```

### 2.1 Non-Automatic Weighing Instruments (NAWI)
- **International Standard**: **OIML R 76-1:2006**
- **Indian Statutory Rule**: **Legal Metrology (General) Rules, 2011 — Seventh Schedule, Heading A**
- **Definition**: An instrument that requires the **intervention of an operator** during the weighing process (e.g., manually placing or removing the load on the pan, determining the weight reading, operating tare functions, or confirming transaction acceptability).
- **Core Testing Protocols**:
  1. **Zero-setting and Zero-tracking Test**: Ensuring the scale rests at zero without tare drift.
  2. **Eccentricity (Corner Load) Test**: Placing $1/3$ max capacity at corners/quadrants of the platter to verify off-center accuracy.
  3. **Repeatability Test**: Repeatedly loading and unloading $50\%$ to $100\%$ capacity to check repeatability error.
  4. **Weighing Performance / MPE Test**: Applying incremental and decremental test weights across the full range up to Maximum Capacity ($\text{Max}$).
- **Recent Amendments**: Under the *Legal Metrology (General) Fourth Amendment Rules*, repeatable performance allows substituting up to two-thirds or four-fifths of test weights with constant dummy loads for high-capacity weighbridges.

### 2.2 Automatic Weighing Instruments (AWI)
- **International Standards**: **OIML R 50, R 51, R 61, R 106, R 107, R 134**
- **Indian Statutory Rule**: **Legal Metrology (General) Rules, 2011 — Seventh Schedule, Heading C**
- **Definition**: An instrument that determines the mass of a product **without the intervention of an operator** and follows a predetermined program of automatic processes.
- **Why AWI Requires Distinct Metrological Rules**:
  - Influenced by dynamic factors: conveyor belt velocity, motor vibration, aerodynamic drag, and material density variations.
  - Requires two-stage verification: **Static deadweight test** followed by **In-situ dynamic material test** using real commercial packages.

#### The 6 Principal AWI Types under OIML:
1. **Automatic Catchweighers / Checkweighers (OIML R 51)**:
   - Weighs individual, discrete items traveling along a conveyor (e.g., verifying 500g packaged food, parcels in courier hubs).
   - Accuracy Classes: **Class $\text{XI, XII, XIII, XIIII}$** or **Category $\text{Y(a), Y(b)}$**.
2. **Automatic Gravimetric Filling Instruments (OIML R 61)**:
   - Fills containers with a predetermined constant mass of bulk solid material (e.g., 50 kg cement bagging, grain bagging, fertilizer packaging).
   - Accuracy Classes: **Class $\text{Ref}(x)$ / Class $X(x)$** (e.g., $X(0.2), X(0.5)$).
3. **Continuous Totalisers / Belt Weighers (OIML R 50)**:
   - Continuously measures the mass of bulk product (coal, limestone, iron ore, grains) moving on a conveyor belt without interrupting movement.
   - Accuracy Classes: **Class 0.5, Class 1, Class 2**.
4. **Discontinuous Totalisers / Totalising Hopper Weighers (OIML R 107)**:
   - Weighs bulk product in discrete batches (e.g., grain discharge at port silos, chemical reactor feed hoppers).
   - Accuracy Classes: **Class 0.2, Class 0.5, Class 1, Class 2**.
5. **Automatic Rail-weighbridges (OIML R 106)**:
   - Weighs railway wagons while the train is in motion across a track sensor.
   - Accuracy Classes: **Class 0.2, Class 0.5, Class 1, Class 2**.
6. **Weigh-in-Motion (WIM) Road Vehicles (OIML R 134)**:
   - Measures the total vehicle mass and axle loads of moving commercial trucks on expressways and toll plazas.

---

## 3. Accuracy Classes & Metrological Parameters

### 3.1 Verification Scale Interval ($e$) vs. Actual Scale Interval ($d$)
- **Actual Scale Interval ($d$)**: The smallest digital graduation or display increment (e.g., 0.1 mg, 0.01 g, 1 g, 10 kg).
- **Verification Scale Interval ($e$)**: The value, expressed in units of mass, used for statutory classification and verification. All legal tolerances (MPE) are calculated with reference to $e$.
- For commercial Class III retail scales, $e = d$. For precision laboratory balances (Class I/II), $d$ can be $0.1 e$ or $0.01 e$.

### 3.2 The Four NAWI Accuracy Classes (OIML R 76 / Seventh Schedule)

| Accuracy Class | Class Mark | Verification Scale Interval ($e$) | Minimum Capacity ($\text{Min}$) | Number of Scale Intervals ($n = \frac{\text{Max}}{e}$) | Typical Commercial Uses |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Special Accuracy** | **Class I** | $0.001\text{ g} \le e$ ($e \le 1\text{ mg}$) | $100 e$ | $n \ge 50,000$ | Pharmaceutical analysis, micro-balances, scientific research, gold assaying. |
| **High Accuracy** | **Class II** | $0.001\text{ g} \le e \le 0.05\text{ g}$ | $20 e$ to $50 e$ | $100 \le n \le 100,000$ | Jewellery showrooms (gold, silver, diamonds), precious stones, chemical compounding. |
| **Medium Accuracy** | **Class III** | $0.1\text{ g} \le e \le 2\text{ g}$ or $e \ge 5\text{ g}$ | $20 e$ | $500 \le n \le 10,000$ | Retail counter scales (grocery, supermarkets), platform scales, weighbridges. |
| **Ordinary Accuracy** | **Class IIII** | $e \ge 5\text{ g}$ | $10 e$ | $100 \le n \le 1,000$ | Bulk construction aggregates (sand, gravel), scrap metal. |

> [!NOTE]
> **Mandatory Retail Requirement in India**: Under the Legal Metrology Rules, any retailer dealing in packaged commodities is legally mandated to maintain a weighing instrument of **at least Accuracy Class III**, with a smallest division ($e$) of at least 1 gram.

### 3.3 Maximum Permissible Error (MPE) Limits
The statutory error threshold permitted during inspection:

$$\text{For Initial Verification:}$$
$$\begin{cases} 
\pm 0.5 e & \text{for loads } 0 \le m \le 500 e \\ 
\pm 1.0 e & \text{for loads } 500 e < m \le 2000 e \\ 
\pm 1.5 e & \text{for loads } 2000 e < m \le 10000 e 
\end{cases}$$

$$\text{For In-Service Re-verification:}$$
$$\begin{cases} 
\pm 1.0 e & \text{for loads } 0 \le m \le 500 e \\ 
\pm 2.0 e & \text{for loads } 500 e < m \le 2000 e \\ 
\pm 3.0 e & \text{for loads } 2000 e < m \le 10000 e 
\end{cases}$$

---

## 4. Complete Taxonomy of Regulated Instruments in India & Our System

Our system categorizes all statutory instruments into 7 primary `InstrumentType` enums:

```typescript
enum InstrumentType {
  NON_AUTOMATIC_WEIGHING_INSTRUMENT = "NON_AUTOMATIC_WEIGHING_INSTRUMENT",
  AUTOMATIC_WEIGHING_INSTRUMENT     = "AUTOMATIC_WEIGHING_INSTRUMENT",
  FUEL_DISPENSER                    = "FUEL_DISPENSER",
  STORAGE_TANK                      = "STORAGE_TANK",
  LENGTH_MEASURE                    = "LENGTH_MEASURE",
  CAPACITY_MEASURE                  = "CAPACITY_MEASURE",
  OTHER                             = "OTHER",
}
```

---

### 4.1 NON_AUTOMATIC_WEIGHING_INSTRUMENT (NAWI)
- **Statutory Rule**: Seventh Schedule, Heading A & B (Legal Metrology General Rules, 2011) / OIML R 76.
- **Verification Cycle**: **12 Months (Annual)**.

| Category Code | Statutory Name / Description | Target Industries / Users | Typical Capacity | Verification Protocol |
| :--- | :--- | :--- | :--- | :--- |
| `NAWI-ClassI` | Analytical Balance | Pharma R&D, forensic labs, bullion mints | $100\text{ g} - 5\text{ kg}$ ($e \le 1\text{ mg}$) | High-precision deadweight comparison |
| `NAWI-ClassII` | Jewellery & Precision Scale | Hallmarked gold/diamond jewellery stores | $500\text{ g} - 50\text{ kg}$ ($e = 10\text{ mg} - 1\text{ g}$) | Working standard weights + corner test |
| `NAWI-ClassIII` | Commercial Counter & Platform Scale | Kirana shops, supermarkets, APMC mandis | $15\text{ kg} - 1\text{ t}$ ($e = 2\text{ g} - 50\text{ g}$) | Standard weights up to max capacity |
| `NAWI-ClassIIII`| Ordinary Bulk Scale | Sand, gravel, building material yards | $1\text{ t} - 10\text{ t}$ ($e \ge 100\text{ g}$) | Heavy cast iron deadweights |
| `NAWI-Weighbridge` | Electronic Vehicle Weighbridge (Dharam Kanta) | Highway logistics, mining hubs, freight depots | $30\text{ t} - 100\text{ t}$ | Heavy test lorry + strain load substitution |

---

### 4.2 AUTOMATIC_WEIGHING_INSTRUMENT (AWI)
- **Statutory Rule**: Seventh Schedule, Heading C (Legal Metrology General Rules, 2011) / OIML R 50, R 51, R 61, R 106, R 107.
- **Verification Cycle**: **12 Months (Annual)**.

| Category Code | Statutory Name / Description | Target Industries / Users | OIML Standard | Verification Protocol |
| :--- | :--- | :--- | :--- | :--- |
| `AWI-Catchweigher` | In-Line Checkweigher | FMCG packaging lines, e-commerce hubs | OIML R 51 | 60-package dynamic speed test |
| `AWI-GravimetricFiller`| Automatic Bagging / Filling Machine | Cement factories (50kg), fertilizer plants | OIML R 61 | Dynamic mass cut-off verification |
| `AWI-BeltWeigher` | Continuous Conveyor Belt Weigher | Coal thermal power plants, mining ports | OIML R 50 | Conveyor revolution zero test + bulk test |
| `AWI-Discontinuous` | Totalising Hopper Weigher | Grain silos (FCI), port bulk loading | OIML R 107 | Batch dump cycle evaluation |
| `AWI-RailWeighbridge` | In-Motion Railway Track Scale | Indian Railways, steel plants, ports | OIML R 106 | Test train runs at 15 km/h |

---

### 4.3 FUEL_DISPENSER (Liquid Measuring Systems)
- **Statutory Rule**: Eighth Schedule, Part IV — *Measuring System for Liquids Other Than Water* / OIML R 117-1.
- **Verification Cycle**: **12 Months (Annual)**.
- **Statutory MPE**: $\pm 0.5\%$ (i.e., $\pm 25\text{ mL}$ for a standard $5\text{ L}$ delivery).

| Category Code | Statutory Name / Description | Target Outlets / Users | Verification Protocol |
| :--- | :--- | :--- | :--- |
| `FUEL-SingleNozzle` | Single-Product Fuel Dispenser | Petrol/diesel retail stations | 5L & 10L conical test measures at max/min flow |
| `FUEL-MultiProduct` | Multi-Product Dispenser (MPD) | Multi-fuel highway retail outlets | Independent test per nozzle (MS, HSD, Speed) |
| `FUEL-HighFlow` | High-Speed Commercial Diesel Dispenser | Truck stops, bus depots, mining bowsers (>100 L/min) | 50L proving measure |
| `FUEL-CNG` | Compressed Natural Gas Dispenser | City gas retail stations (IGL, MGL) (OIML R 139) | Coriolis mass meter or gravimetric cylinder |
| `FUEL-LPG` | Auto-LPG Dispenser | Automotive gas filling stations | Pressurized proving system |

---

### 4.4 STORAGE_TANK (Bulk Storage & Vats)
- **Statutory Rule**: Ninth Schedule (Legal Metrology General Rules, 2011) / OIML R 71.
- **Verification Cycle**: **60 Months (5 Years)** for bulk tanks; **12 Months** for dipsticks.

| Category Code | Statutory Name / Description | Target Outlets / Users | Verification Protocol |
| :--- | :--- | :--- | :--- |
| `TANK-Vertical` | Vertical Cylindrical Petroleum Storage Tank | Oil refinery depots (IOCL, BPCL, HPCL) | Strapping method (circumference) / Laser triangulation |
| `TANK-Underground` | Underground Fuel Storage Tank | Petrol retail stations | Liquid proving or geometric calculation |
| `TANK-VolumetricVat`| Industrial Processing Vat | Breweries, distilleries, dairy silos | Volumetric liquid transfer calibration |
| `TANK-Dipstick` | Calibrated Dipstick / Ullage Gauge | Tanker trucks & fuel storage tanks | Linear millimeter graduation check |

---

### 4.5 LENGTH_MEASURE (Linear Measures)
- **Statutory Rule**: Second Schedule (Legal Metrology General Rules, 2011) / OIML R 35.
- **Verification Cycle**: **12 Months (Annual)**.

| Category Code | Statutory Name / Description | Target Users | Verification Protocol |
| :--- | :--- | :--- | :--- |
| `LEN-SteelTape` | Steel Measuring Tape (1m to 50m) | Construction, architects, surveyors | Comparison with statutory benchmark scale |
| `LEN-RigidMeter` | Metallic Fabric Meter Bar | Textile retail shops, cloth merchants | Verification of brass end-plugs against wear |
| `LEN-SurveyorTape` | Long Surveyor Steel/Fiberglass Tape | Land revenue departments, civil survey | Tensioned alignment test |
| `LEN-FabricCounter` | Linear Fabric / Wire Counter | Textile mills, cable manufacturers | Wheel circumference and revolution counter check |

---

### 4.6 CAPACITY_MEASURE (Liquid Capacity Measures)
- **Statutory Rule**: Third Schedule (Legal Metrology General Rules, 2011) / OIML R 120.
- **Verification Cycle**: **12 Months (Annual)**.

| Category Code | Statutory Name / Description | Target Users | Verification Protocol |
| :--- | :--- | :--- | :--- |
| `CAP-Conical` | Conical Metallic Liquid Measure (100ml - 5L)| Kerosene, edible oil, milk vendors | Gravimetric water test against working standards |
| `CAP-Cylindrical` | Cylindrical Liquid Measure | Dairy collection booths | Gravimetric volume test |
| `CAP-LiquorPeg` | Commercial Peg Measure (30 ml / 60 ml) | Bars, hotels, restaurants | Volumetric test to prevent short pouring |
| `CAP-VolumetricTest`| Standard Proving Measure (5L, 10L, 20L) | LMO test kits, petrol pump test cans | Primary volumetric calibration |

---

### 4.7 OTHER (Specialized Regulated Instruments)
- **Statutory Rule**: Eighth, Tenth, Eleventh & Twelfth Schedules / OIML R 21, R 114, R 148, R 59.
- **Verification Cycle**: **12 Months (Annual)**.

| Category Code | Statutory Name / Description | Regulatory Schedule | Verification Protocol |
| :--- | :--- | :--- | :--- |
| `SPEC-TaxiMeter` | Auto-Rickshaw / Taxi Fare Meter | Schedule X / OIML R 21 | 1 km road test track + elapsed wait time clock |
| `SPEC-Thermometer` | Clinical Thermometer (Glass / Digital) | Schedule XI / OIML R 114 | Temperature-controlled water bath test |
| `SPEC-BP-Monitor` | Sphygmomanometer (BP Monitor) | Schedule XI / OIML R 148 | Mercury column / transducer pressure test |
| `SPEC-GrainMoisture`| Agricultural Grain Moisture Meter | Schedule XII / OIML R 59 | Comparison against oven drying standard |
| `SPEC-ExhaustGas` | Automobile Exhaust Gas Analyser (PUC) | Schedule VIII / OIML R 99 | Calibration with standard span gas canisters |

---

## 5. Model Approval vs. Routine Verification

```
┌────────────────────────────────────────────────────────┐
│ 1. Model Approval (Type Approval)                      │
│    • Authority: Central Govt (Director of Metrology)   │
│    • Section: Section 22 of Act                        │
│    • Number Format: IND/XX/YY/ZZZ                      │
│    • Once per design/prototype before manufacturing    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Routine Periodic Verification                       │
│    • Authority: State LMO or Authorized GATC           │
│    • Section: Section 24 of Act & Rule 27              │
│    • Output: Verification Certificate & Security Seal  │
│    • Interval: Every 12 Months (Storage Tanks: 60M)    │
└────────────────────────────────────────────────────────┘
```

1. **Model Approval (Section 22)**:
   - Evaluates instrument design, circuitry, metrological software, and tamper resistance.
   - Tested by national testing laboratories (**RRSL**, **FCRI Palakkad**).
   - Generates official certificate: e.g., `IND/09/24/412` (*Country / State Code / Year / Sequential Number*).
2. **Periodic Verification & Stamping (Section 24 & Rule 27)**:
   - Routine in-service calibration carried out on-site by **LMOs** or **GATCs**.
   - Verifies error within **Maximum Permissible Error (MPE)** limits.
   - Applies physical tamper-evident seals (lead seal, wire seal, hologram sticker).
   - Issues **Form VII Digital Verification Certificate** with encrypted QR code.

---

## 6. Role of GATC (Government Approved Test Centres)

Under the **Legal Metrology (Government Approved Test Centre) Rules, 2013**, the Central Government authorized accredited third-party laboratories to operate as **Government Approved Test Centres (GATCs)** to assist State LMOs in verifying high-volume commercial instruments:
- Must hold **NABL Accreditation (ISO/IEC 17025)** in the relevant metrological field.
- Authorized Scopes:
  - Non-Automatic Weighing Instruments up to 50 kg (counter scales).
  - Platform scales up to 200 kg.
  - Fuel Dispensers (petrol/diesel nozzles).
  - Water meters and electricity meters.
- In our application:
  - `GATC_ADMIN`: Manages agency accreditation credentials, test equipment traceability, and inspector rosters.
  - `GATC_INSPECTOR`: Performs field verification, logs GPS coordinates, records error readings, and submits verification reports for statutory endorsement.
