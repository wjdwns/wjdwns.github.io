/*
 * 핵심 코드 조각 — 본인(Git 작성자 jun / wjdwns3744) 커밋으로 확인된 코드만 원문 그대로 발췌합니다.
 * 생략한 코드는 "// …"로 표시했고(일부 주석 줄은 생략), url은 해당 커밋의 정확한 줄로 연결됩니다.
 *
 *   repo     : 프로젝트 저장소
 *   snippets : point = 해당 프로젝트 핵심 구현 번호(0부터), title, file, url, why(무엇을 보여주는 코드인지), code
 *
 * InteReal은 Perforce로 작업해 Git 작성자 기록으로 본인 코드를 확인할 수 없어 넣지 않았습니다.
 */
window.PORTFOLIO_CODE = {
  overcooked2: {
    repo: "https://github.com/PotenupDeaBak/OverCooked2",
    snippets: [
      {
        point: 0,
        title: "로컬에서 가장 가까운 대상 탐색",
        file: "Source/OverCooked2/Character/Component/OC2InteractionComponent.cpp",
        url: "https://github.com/PotenupDeaBak/OverCooked2/blob/cc447dc5cff4f0f8fe9ebcc62418bbe2bc6735e1/Source/OverCooked2/Character/Component/OC2InteractionComponent.cpp#L43-L108",
        why: "탐색과 하이라이트는 로컬 플레이어에서만 실행하고, 실제 상호작용은 ServerInteract RPC로 넘깁니다.",
        code: String.raw`void UOC2InteractionComponent::CheckInteract(USceneComponent* GrabPos)
{
    APawn* OwnerPawn = Cast<APawn>(GetOwner());
    if (OwnerPawn && OwnerPawn->GetController() && !OwnerPawn->IsLocallyControlled())
    {
        return;
    }
    // …
    TArray<FHitResult> HitResults;
    bool bHit = GetWorld()->SweepMultiByObjectType(
       HitResults,
       TraceLocation, TraceLocation,
       FQuat::Identity,
       ObjectQueryParams,
       FCollisionShape::MakeSphere(TraceRadius),
       QueryParams
    );

    if (bHit)
    {
       HitResults.Sort([TraceLocation](const FHitResult& A, const FHitResult& B) {
          return FVector::DistSquared(TraceLocation, A.GetActor()->GetActorLocation()) < FVector::DistSquared(TraceLocation, B.GetActor()->GetActorLocation());
       });

       AOC2BaseActor* ClosestActor = nullptr;
       for (const FHitResult& Hit : HitResults)
       {
           if (AActor* HitActor = Hit.GetActor())
           {
               if (AOC2BaseActor* Interactable = Cast<AOC2BaseActor>(HitActor))
               {
                   ClosestActor = Interactable;
                   break;
               }
           }
       }
       // … 이전 대상 하이라이트 해제 · 새 대상 하이라이트
    }
}`,
      },
    ],
  },

  furi: {
    repo: "https://github.com/Furi-Imitation/Furi",
    snippets: [
      {
        point: 1,
        title: "Custom EffectContext의 NetSerialize",
        file: "Source/Furi/GamePlayAbilitySystem/FuriAbilityTypes.cpp",
        url: "https://github.com/Furi-Imitation/Furi/blob/3fe42c1c65f7be5beeeae9ec8fbb68379cf09e12/Source/Furi/GamePlayAbilitySystem/FuriAbilityTypes.cpp#L3-L30",
        why: "부모 컨텍스트를 먼저 직렬화한 뒤, 데미지 정보는 필요한 필드만 보냅니다. enum은 uint8로 줄여 전송합니다. (커밋 5c8202d · 2026-03-28)",
        code: String.raw`bool FFuriGameplayEffectContext::NetSerialize(FArchive& Ar, class UPackageMap* Map, bool& bOutSuccess)
{
    // 1. 부모 클래스(기본 GAS 정보: Instigator, Target 등)의 데이터를 먼저 직렬화합니다.
    FGameplayEffectContext::NetSerialize(Ar, Map, bOutSuccess);

    // 2. 커스텀 데이터(DamageInfo) 직렬화
    // 네트워크 대역폭 절약을 위해 필요한 데이터만 선별적으로 아카이브(Ar)에 넣습니다.
    Ar << DamageInfo.Amount; // 데미지 수치 전송

    // Enum(열거형)은 uint8로 변환하여 최소한의 용량으로 전송합니다.
    uint8 DamageTypeInt = static_cast<uint8>(DamageInfo.DamageType);
    Ar << DamageTypeInt;
    DamageInfo.DamageType = static_cast<EFuriDamageType>(DamageTypeInt);

    uint8 DamageResponseInt = static_cast<uint8>(DamageInfo.DamageResponse);
    Ar << DamageResponseInt;
    DamageInfo.DamageResponse = static_cast<EFuriDamageResponse>(DamageResponseInt);

    // 불리언(bool) 값들을 비트 단위로 전송
    Ar << DamageInfo.bShouldDamageInvincible; // 무적 무시 여부
    Ar << DamageInfo.bCanBeBlocked;            // 가드 가능 여부
    Ar << DamageInfo.bCanBeParried;            // 패링 가능 여부
    Ar << DamageInfo.bShouldForceInterrupt;    // 강제 경직 발생 여부

    bOutSuccess = true;
    return true;
}`,
      },
    ],
  },

  gearofthree: {
    repo: "https://github.com/GearOfThree/Gear_3",
    snippets: [
      {
        point: 2,
        title: "충돌 법선 기반 반사",
        file: "Source/GearOfThree/EnemyNPC/Private/BuzzKillProjectile.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/BuzzKillProjectile.cpp#L222-L235",
        why: "직전 프레임 속도를 표면 법선으로 반사(R = V − 2(V·n)n)하고, 법선 방향으로 1cm 밀어내 같은 면에 다시 부딪히지 않게 합니다.",
        code: String.raw`    FVector IncomingVelocity = LastFrameVelocity;
    FVector Normal = Hit.ImpactNormal;

    float DotProduct = FVector::DotProduct(IncomingVelocity, Normal);
    FVector ReflectedVelocity = IncomingVelocity - (2 * DotProduct * Normal);
    ReflectedVelocity *= Bounciness;

    if (ProjectileMesh)
    {
        ProjectileMesh->SetPhysicsLinearVelocity(ReflectedVelocity);
    }

    FVector Nudge = Normal * 1.0f;
    SetActorLocation(GetActorLocation() + Nudge);`,
      },
      {
        point: 2,
        title: "Actor Pool에서 발사체 꺼내기",
        file: "Source/GearOfThree/EnemyNPC/Private/GearWeaponBase.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/GearWeaponBase.cpp#L46-L77",
        why: "쉬고 있는 발사체를 재사용하고, 모두 사용 중일 때만 하나를 새로 만들어 Pool에 추가합니다.",
        code: String.raw`AGearProjectile* AGearWeaponBase::GetPooledProjectile()
{
	for (AGearProjectile* Proj : ProjectilePool)
	{
		if (Proj && !Proj->bIsActive)
		{
			return Proj;
		}
	}

	// 2. 만약 20발이 전부 날아가고 있어서 빈 총알이 하나도 없다면? (안전 장치)
	// 에러가 나지 않게 실시간으로 하나 더 스폰해서 풀(Pool)을 늘려줍니다.
	if (ProjectileClass)
	{
		// … SpawnParams 설정
		AGearProjectile* ExtraProj = GetWorld()->SpawnActor<AGearProjectile>(ProjectileClass, FVector::ZeroVector, FRotator::ZeroRotator, SpawnParams);
		if (ExtraProj)
		{
			ExtraProj->DeactivateProjectile();
			ProjectilePool.Add(ExtraProj);
			return ExtraProj;
		}
	}

	return nullptr;
}`,
      },
    ],
  },
};
