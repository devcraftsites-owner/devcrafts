import type { JavaArticleDetail } from "../types"

import { articles as dates } from "./dates"
import { articles as validation } from "./validation"
import { articles as collections } from "./collections"
import { articles as concurrency } from "./concurrency"
import { articles as copying } from "./copying"
import { articles as encoding } from "./encoding"
import { articles as enumArticles } from "./enum"
import { articles as fileio } from "./fileio"
import { articles as functional } from "./functional"
import { articles as gc } from "./gc"
import { articles as httpserver } from "./httpserver"
import { articles as logging } from "./logging"
import { articles as misc } from "./misc"
import { articles as network } from "./network"
import { articles as oop } from "./oop"
import { articles as patterns } from "./patterns"
import { articles as perf } from "./perf"
import { articles as records } from "./records"
import { articles as reflection } from "./reflection"
import { articles as security } from "./security"
import { articles as serialization } from "./serialization"
import { articles as strings } from "./strings"
import { articles as testing } from "./testing"
import { articles as threading } from "./threading"
import { articles as db } from "./db"
import { articles as batch } from "./batch"

export const JAVA_ARTICLES: JavaArticleDetail[] = [
  ...dates,
  ...validation,
  ...collections,
  ...concurrency,
  ...copying,
  ...encoding,
  ...enumArticles,
  ...fileio,
  ...functional,
  ...gc,
  ...httpserver,
  ...logging,
  ...misc,
  ...network,
  ...oop,
  ...patterns,
  ...perf,
  ...records,
  ...reflection,
  ...security,
  ...serialization,
  ...strings,
  ...testing,
  ...threading,
  ...db,
  ...batch,
]
